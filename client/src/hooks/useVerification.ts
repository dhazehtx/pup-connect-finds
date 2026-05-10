
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { VerificationRequest, VerificationDocument, BackgroundCheck } from '@/types/verification';

export const useVerification = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [backgroundChecks, setBackgroundChecks] = useState<BackgroundCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  type DbVerificationRequest = {
    id: string;
    user_id: string;
    verification_type: string;
    status: string;
    submitted_at: string;
    reviewed_at: string | null;
    reviewer_id: string | null;
    rejection_reason: string | null;
    id_document: string | null;
    address_proof: string | null;
    business_license: string | null;
    experience_details: string | null;
    contact_verification: any;
    created_at: string;
    updated_at: string;
  };

  type DbVerificationDocument = {
    id: string;
    user_id: string;
    verification_request_id: string | null;
    document_type: string;
    file_name: string;
    file_url: string;
    file_size: number | null;
    mime_type: string | null;
    status: string;
    uploaded_at: string;
    reviewed_at: string | null;
    rejection_reason: string | null;
  };

  type DbBackgroundCheck = {
    id: string;
    user_id: string;
    provider: string;
    check_type: string;
    external_id: string | null;
    status: string;
    results: any;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
  };

  const normalizeVerificationRequest = (item: DbVerificationRequest): VerificationRequest => ({
    ...item,
    verification_type: item.verification_type as VerificationRequest['verification_type'],
    status: item.status as VerificationRequest['status'],
    reviewed_at: item.reviewed_at ?? undefined,
    reviewer_id: item.reviewer_id ?? undefined,
    rejection_reason: item.rejection_reason ?? undefined,
    id_document: item.id_document ?? undefined,
    address_proof: item.address_proof ?? undefined,
    business_license: item.business_license ?? undefined,
    experience_details: item.experience_details ?? undefined,
  });

  const normalizeVerificationDocument = (item: DbVerificationDocument): VerificationDocument => ({
    ...item,
    document_type: item.document_type as VerificationDocument['document_type'],
    status: item.status as VerificationDocument['status'],
    verification_request_id: item.verification_request_id ?? undefined,
    file_size: item.file_size ?? undefined,
    mime_type: item.mime_type ?? undefined,
    reviewed_at: item.reviewed_at ?? undefined,
    rejection_reason: item.rejection_reason ?? undefined,
  });

  const normalizeBackgroundCheck = (item: DbBackgroundCheck): BackgroundCheck => ({
    ...item,
    status: item.status as BackgroundCheck['status'],
    external_id: item.external_id ?? undefined,
    expires_at: item.expires_at ?? undefined,
  });

  const submitVerificationRequest = useCallback(async (
    verificationType: string,
    documents: { type: string; file: File }[],
    additionalData?: any
  ) => {
    if (!user) return null;

    setLoading(true);
    try {
      // First, upload documents
      const uploadedDocs = [];
      for (const doc of documents) {
        const fileExt = doc.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // In a real implementation, you would upload to Supabase storage
        // For now, we'll simulate the upload
        const mockFileUrl = `https://example.com/uploads/${fileName}`;
        uploadedDocs.push({
          type: doc.type,
          url: mockFileUrl,
          name: doc.file.name,
          size: doc.file.size
        });
      }

      // Create verification request
      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          user_id: user.id,
          verification_type: verificationType,
          status: 'pending',
          submitted_at: new Date().toISOString(),
          ...additionalData
        })
        .select()
        .single();

      if (error) throw error;

      // Create document records
      for (const doc of uploadedDocs) {
        await supabase
          .from('verification_documents')
          .insert({
            user_id: user.id,
            verification_request_id: data.id,
            document_type: doc.type,
            file_name: doc.name,
            file_url: doc.url,
            file_size: doc.size,
            status: 'pending'
          });
      }

      await loadVerificationData();
      
      toast({
        title: "Verification Submitted",
        description: "Your verification request has been submitted for review",
      });

      return data;
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit verification request",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const requestBackgroundCheck = useCallback(async (checkType: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('request-background-check', {
        body: {
          user_id: user.id,
          check_type: checkType
        }
      });

      if (error) throw error;

      await loadVerificationData();
      
      toast({
        title: "Background Check Requested",
        description: "Your background check has been initiated",
      });

      return data;
    } catch (error) {
      console.error('Error requesting background check:', error);
      toast({
        title: "Request Failed",
        description: "Failed to request background check",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  const loadVerificationData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [requestsResponse, documentsResponse, checksResponse] = await Promise.all([
        supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('verification_documents')
          .select('*')
          .eq('user_id', user.id)
          .order('uploaded_at', { ascending: false }),
        supabase
          .from('background_checks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (requestsResponse.error) throw requestsResponse.error;
      if (documentsResponse.error) throw documentsResponse.error;
      if (checksResponse.error) throw checksResponse.error;

      // Type assertion for verification requests
      const typedRequests = (requestsResponse.data || []).map(item => normalizeVerificationRequest(item as DbVerificationRequest));
      const typedDocuments = (documentsResponse.data || []).map(item => normalizeVerificationDocument(item as DbVerificationDocument));
      const typedChecks = (checksResponse.data || []).map(item => normalizeBackgroundCheck(item as DbBackgroundCheck));

      setVerificationRequests(typedRequests);
      setDocuments(typedDocuments);
      setBackgroundChecks(typedChecks);
    } catch (error) {
      console.error('Error loading verification data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getVerificationStatus = useCallback(() => {
    const identityVerified = verificationRequests.some(
      req => req.verification_type === 'identity' && req.status === 'approved'
    );
    const businessVerified = verificationRequests.some(
      req => req.verification_type === 'business' && req.status === 'approved'
    );
    const backgroundCheckPassed = backgroundChecks.some(
      check => check.status === 'completed'
    );

    return {
      identityVerified,
      businessVerified,
      backgroundCheckPassed,
      overallTrustScore: calculateTrustScore(identityVerified, businessVerified, backgroundCheckPassed)
    };
  }, [verificationRequests, backgroundChecks]);

  const calculateTrustScore = (identity: boolean, business: boolean, background: boolean) => {
    let score = 0;
    if (identity) score += 40;
    if (business) score += 30;
    if (background) score += 30;
    return score;
  };

  useEffect(() => {
    if (user) {
      loadVerificationData();
    }
  }, [user, loadVerificationData]);

  return {
    verificationRequests,
    documents,
    backgroundChecks,
    loading,
    submitVerificationRequest,
    requestBackgroundCheck,
    loadVerificationData,
    getVerificationStatus
  };
};
