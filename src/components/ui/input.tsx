
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    console.log('🔍 Input component props:', props);
    console.log('🔍 Input component value:', props.value);
    console.log('🔍 Input component name:', props.name);
    console.log('🔍 Input component placeholder:', props.placeholder);
    
    // Check for potential event handling issues
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log('🔍 Input change event:', e.target.value, 'for field:', props.name);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      console.log('🔍 Input input event:', (e.target as HTMLInputElement).value, 'for field:', props.name);
    };
    
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
          WebkitAppearance: 'none !important',
          appearance: 'none !important',
          outline: 'none !important'
        }}
        ref={ref}
        {...props}
        onChange={handleChange}
        onInput={handleInput}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
