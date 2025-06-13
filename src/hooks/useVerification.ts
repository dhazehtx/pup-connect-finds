
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
      const typedRequests = (requestsResponse.data || []).map(item => ({
        ...item,
        verification_type: item.verification_type as VerificationRequest['verification_type'],
        status: item.status as VerificationRequest['status']
      }));

      // Type assertion for documents
      const typedDocuments = (documentsResponse.data || []).map(item => ({
        ...item,
        document_type: item.document_type as VerificationDocument['document_type'],
        status: item.status as VerificationDocument['status']
      }));

      // Type assertion for background checks
      const typedChecks = (checksResponse.data || []).map(item => ({
        ...item,
        status: item.status as BackgroundCheck['status']
      }));

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
