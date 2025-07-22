
export interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: 'identity' | 'breeder' | 'business' | 'background_check';
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  rejection_reason?: string;
  id_document?: string;
  address_proof?: string;
  business_license?: string;
  experience_details?: string;
  contact_verification?: any;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  user_id: string;
  verification_request_id?: string;
  document_type: 'id' | 'address' | 'business_license' | 'certification' | 'other';
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export interface BackgroundCheck {
  id: string;
  user_id: string;
  provider: string;
  check_type: string;
  external_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  results?: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export interface TrustScore {
  user_id: string;
  overall_score: number;
  identity_verified: boolean;
  background_check_passed: boolean;
  business_verified: boolean;
  review_score: number;
  transaction_history_score: number;
  social_verification_score: number;
  last_updated: string;
}
