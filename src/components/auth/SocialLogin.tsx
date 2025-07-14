
import React from 'react';
import SocialLoginButtons from './SocialLoginButtons';

interface SocialLoginProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

const SocialLogin = ({ onSuccess, disabled = false }: SocialLoginProps) => {
  return <SocialLoginButtons onSuccess={onSuccess} disabled={disabled} />;
};

export default SocialLogin;
