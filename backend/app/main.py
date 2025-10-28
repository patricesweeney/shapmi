from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
import numpy as np
from sklearn.feature_selection import mutual_info_classif, mutual_info_regression
from sklearn.preprocessing import LabelEncoder
try:
    from scipy.stats import entropy as scipy_entropy, differential_entropy
    _has_scipy = True
except Exception:  # pragma: no cover
    _has_scipy = False

app = FastAPI(title="ShapMI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/columns")
async def list_columns(file: UploadFile = File(...)):
    content = await file.read()
    buffer = io.BytesIO(content)
    try:
        if file.filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(buffer, nrows=0)
        else:
            df = pd.read_csv(buffer, nrows=0)
    except Exception as exc:
        return JSONResponse(status_code=400, content={"error": f"Failed to read file header: {exc}"})
    return {"columns": list(df.columns)}


@app.post("/mi/shapley")
async def shapley_mi(
    file: UploadFile = File(...),
    target: str = Form(...),
):
    content = await file.read()
    buffer = io.BytesIO(content)
    try:
        if file.filename.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(buffer)
        else:
            df = pd.read_csv(buffer)
    except Exception as exc:
        return JSONResponse(status_code=400, content={"error": f"Failed to parse file: {exc}"})

    if target not in df.columns:
        return JSONResponse(status_code=400, content={"error": f"Target '{target}' not found in columns"})

    feature_cols = [c for c in df.columns if c != target]

    # Drop rows with missing values in features or target for MI computation
    work = df[feature_cols + [target]].dropna()
    y_series = work[target]
    X_df = work[feature_cols]

    # Determine problem type
    is_y_numeric = pd.api.types.is_numeric_dtype(y_series)
    is_classification = not is_y_numeric

    # Encode categorical features
    X_list = []
    discrete_mask = []
    for col in feature_cols:
        s = X_df[col]
        if pd.api.types.is_numeric_dtype(s):
            X_list.append(s.to_numpy())
            discrete_mask.append(False)
        else:
            enc = LabelEncoder()
            X_list.append(enc.fit_transform(s.astype(str)).astype(np.int64))
            discrete_mask.append(True)
    X = np.vstack(X_list).T if X_list else np.empty((len(X_df), 0))
    discrete_mask_arr = np.array(discrete_mask, dtype=bool) if len(discrete_mask) else np.array([], dtype=bool)

    # Encode target for classification
    if is_classification:
        y_enc = LabelEncoder().fit_transform(y_series.astype(str))
        mi = mutual_info_classif(X, y_enc, discrete_features=discrete_mask_arr, random_state=0) if X.shape[1] else np.array([])
    else:
        y_enc = y_series.to_numpy(dtype=float)
        mi = mutual_info_regression(X, y_enc, discrete_features=discrete_mask_arr, random_state=0) if X.shape[1] else np.array([])

    # Convert MI from nats to bits for comparability with entropy in bits
    ln2 = np.log(2.0)
    mi_bits = (mi / ln2).astype(float) if mi.size else mi
    total_mi = float(np.sum(mi_bits)) if mi_bits.size else 0.0
    contributions = [
        {"feature": c, "value": float(mi_bits[i])}
        for i, c in enumerate(feature_cols)
    ] if mi_bits.size else []

    # Compute target entropy (bits)
    entropy = 0.0
    try:
        if is_classification:
            probs = y_series.value_counts(normalize=True, dropna=True).to_numpy()
            if _has_scipy:
                entropy = float(scipy_entropy(probs, base=2))
            else:
                probs = probs[probs > 0]
                entropy = float(-(probs * np.log2(probs)).sum())
        else:
            arr = y_series.to_numpy(dtype=float)
            if _has_scipy:
                try:
                    entropy = float(differential_entropy(arr, base=2))
                except TypeError:
                    # Older SciPy without base: compute in nats then convert
                    entropy = float(differential_entropy(arr) / ln2)
            else:
                # Fallback: discretize numeric target into bins
                binned = pd.cut(arr, bins=10, include_lowest=True)
                probs = binned.value_counts(normalize=True, dropna=True).values
                probs = probs[probs > 0]
                entropy = float(-(probs * np.log2(probs)).sum())
    except Exception:
        entropy = 0.0

    return {
        "target": target,
        "total_mi": total_mi,
        "contributions": contributions,
        "entropy": round(entropy, 3),
    }


