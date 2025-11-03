import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const SheetPortal = DialogPrimitive.Portal
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40', className)}
    {...props}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { side?: 'left' | 'right' | 'top' | 'bottom' }
>(({ className, side = 'left', children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <div
      ref={ref}
      className={cn(
        'fixed z-50 bg-background shadow-lg',
        side === 'left' && 'inset-y-0 left-0 h-full w-80',
        side === 'right' && 'inset-y-0 right-0 h-full w-80',
        side === 'top' && 'inset-x-0 top-0 h-1/3 w-full',
        side === 'bottom' && 'inset-x-0 bottom-0 h-1/3 w-full',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent }


