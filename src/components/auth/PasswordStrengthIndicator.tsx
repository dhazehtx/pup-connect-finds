
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const validatePassword = (password: string) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  return {
    isValid: score === 4,
    score,
    checks: {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecialChar
    }
  };
};

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  if (!password) return null;
  
  const { score, checks } = validatePassword(password);
  
  const getStrengthText = () => {
    if (score <= 1) return { text: 'Weak', color: 'text-red-500' };
    if (score <= 2) return { text: 'Fair', color: 'text-orange-500' };
    if (score <= 3) return { text: 'Good', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };
  
  const { text, color } = getStrengthText();
  
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Password strength:</span>
        <span className={`text-sm font-medium ${color}`}>{text}</span>
      </div>
      
      <div className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 rounded-full ${
              score >= level 
                ? score <= 1 ? 'bg-red-500' 
                  : score <= 2 ? 'bg-orange-500'
                  : score <= 3 ? 'bg-yellow-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <div className={checks.hasMinLength ? 'text-green-600' : 'text-red-500'}>
          ✓ At least 8 characters
        </div>
        <div className={checks.hasUppercase ? 'text-green-600' : 'text-red-500'}>
          ✓ At least 1 uppercase letter
        </div>
        <div className={checks.hasNumber ? 'text-green-600' : 'text-red-500'}>
          ✓ At least 1 number
        </div>
        <div className={checks.hasSpecialChar ? 'text-green-600' : 'text-red-500'}>
          ✓ At least 1 special character
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
