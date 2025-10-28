from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io

from model.compute import analyze_dataset

# ASGI app recognized by Vercel's Python runtime
app = FastAPI(title="ShapMI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/healthz")
def healthz():
    return {"status": "ok"}


@app.post("/api/columns")
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


@app.post("/api/mi/shapley")
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

    try:
        result = analyze_dataset(df, target)
    except Exception as exc:
        return JSONResponse(status_code=400, content={"error": f"Analysis failed: {exc}"})

    return result


