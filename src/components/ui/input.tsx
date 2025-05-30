
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm",
          className
        )}
        style={{
          color: '#000000 !important',
          backgroundColor: '#ffffff !important',
          border: '1px solid #ccc !important',
          fontSize: '16px !important',
          fontFamily: 'system-ui, -apple-system, sans-serif !important',
          WebkitTextFillColor: '#000000 !important',
          WebkitBackgroundClip: 'initial !important',
          WebkitAppearance: 'none',
          appearance: 'none',
          outline: 'none !important'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
