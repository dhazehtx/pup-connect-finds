
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  business_license?: string;
  id_document?: string;
  address_proof?: string;
  experience_details?: string;
  contact_verification?: any;
  submitted_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  rejection_reason?: string;
}

interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export const useVerificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);

  // Submit verification request
  const submitVerificationRequest = useCallback(async (
    verificationType: string,
    data: {
      businessLicense?: string;
      idDocument?: string;
      addressProof?: string;
      experienceDetails?: string;
      contactVerification?: any;
    }
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: requestData, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: verificationType,
          business_license: data.businessLicense,
          id_document: data.idDocument,
          address_proof: data.addressProof,
          experience_details: data.experienceDetails,
          contact_verification: data.contactVerification,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setVerificationRequests(prev => [requestData, ...prev]);
      toast({
        title: "Success",
        description: "Verification request submitted successfully",
      });

      return requestData;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Upload verification document
  const uploadVerificationDocument = useCallback(async (
    file: File,
    documentType: string
  ) => {
    if (!user) return;

    try {
      setLoading(true);

      // Upload file to Supabase Storage (simulated for now)
      const fileUrl = URL.createObjectURL(file);

      const { data, error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: file.name,
          file_url: fileUrl,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setDocuments(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch verification requests
  const fetchVerificationRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerificationRequests(data || []);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
    }
  }, [user]);

  // Fetch verification documents
  const fetchVerificationDocuments = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching verification documents:', error);
    }
  }, [user]);

  // Check verification status
  const checkVerificationStatus = useCallback(async (verificationType: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('verification_badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_type', verificationType)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return null;
    }
  }, [user]);

  return {
    verificationRequests,
    documents,
    loading,
    submitVerificationRequest,
    uploadVerificationDocument,
    fetchVerificationRequests,
    fetchVerificationDocuments,
    checkVerificationStatus
  };
};
