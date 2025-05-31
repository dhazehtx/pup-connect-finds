
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader = ({ isSignUp }: AuthHeaderProps) => {
  const { t } = useTranslation();

  return (
    <CardHeader className="text-center pb-4">
      <div className="w-16 h-16 mx-auto mb-4 bg-royal-blue rounded-full flex items-center justify-center">
        <Heart size={32} className="text-cloud-white" />
      </div>
      <CardTitle className="text-2xl font-bold text-deep-navy">
        {isSignUp ? t('auth.joinMyPup') : t('auth.welcomeBack')}
      </CardTitle>
      <p className="text-deep-navy/70">
        {isSignUp 
          ? t('auth.createAccount')
          : t('auth.signInToAccount')
        }
      </p>
    </CardHeader>
  );
};

export default AuthHeader;
