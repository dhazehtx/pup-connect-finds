
import React from 'react';

interface MinimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // No complex props, just basic HTML input props
}

const MinimalInput = React.forwardRef<HTMLInputElement, MinimalInputProps>(
  (props, ref) => {
    console.log('🔍 MinimalInput props:', props);
    
    return (
      <input
        ref={ref}
        style={{
          width: '100%',
          height: '40px',
          padding: '8px 12px',
          border: '2px solid #333',
          borderRadius: '6px',
          fontSize: '16px',
          color: '#000000',
          backgroundColor: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        {...props}
      />
    );
  }
);

MinimalInput.displayName = "MinimalInput";

export { MinimalInput };
