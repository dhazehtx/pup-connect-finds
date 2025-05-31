
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface ProfileData {
  fullName?: string;
  username?: string;
  bio?: string;
  location?: string;
  phone?: string;
  websiteUrl?: string;
  avatarUrl?: string;
}

interface ProfileCompletionIndicatorProps {
  profile: ProfileData;
  className?: string;
}

const ProfileCompletionIndicator = ({ profile, className }: ProfileCompletionIndicatorProps) => {
  const fields = [
    { key: 'fullName', label: 'Full Name', value: profile.fullName },
    { key: 'username', label: 'Username', value: profile.username },
    { key: 'bio', label: 'Bio', value: profile.bio },
    { key: 'location', label: 'Location', value: profile.location },
    { key: 'phone', label: 'Phone', value: profile.phone },
    { key: 'websiteUrl', label: 'Website', value: profile.websiteUrl },
    { key: 'avatarUrl', label: 'Profile Photo', value: profile.avatarUrl },
  ];

  const completedFields = fields.filter(field => field.value && field.value.trim() !== '');
  const completionPercentage = Math.round((completedFields.length / fields.length) * 100);
  const incompleteFields = fields.filter(field => !field.value || field.value.trim() === '');

  if (completionPercentage === 100) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle size={16} />
        <span className="text-sm font-medium">Profile Complete!</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Profile {completionPercentage}% complete
        </span>
        <span className="text-xs text-gray-500">
          {completedFields.length}/{fields.length} fields
        </span>
      </div>
      
      <Progress value={completionPercentage} className="h-2" />
      
      {incompleteFields.length > 0 && (
        <p className="text-xs text-gray-600">
          Add {incompleteFields.slice(0, 2).map(f => f.label).join(' and ')}
          {incompleteFields.length > 2 ? ` +${incompleteFields.length - 2} more` : ''} to complete your profile
        </p>
      )}
    </div>
  );
};

export default ProfileCompletionIndicator;
