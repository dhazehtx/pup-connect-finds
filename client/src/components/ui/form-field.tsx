
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  error?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: string;
}

const FormField = ({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = 'text',
  error,
  className,
  min,
  max,
  step
}: FormFieldProps) => {
  const InputComponent = type === 'textarea' ? Textarea : Input;
  const inputProps = {
    id,
    name,
    value,
    onChange,
    placeholder,
    required,
    className: cn(
      error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      className
    ),
    ...(type !== 'textarea' && { type }),
    ...(min !== undefined && { min }),
    ...(max !== undefined && { max }),
    ...(step && { step }),
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <InputComponent {...inputProps} />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField;
