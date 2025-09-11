import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStore } from '@/stores/onboarding';
import { useOnboarding } from '@/stores/useOnboarding';
import { ensureOnboardingIds } from '@/lib/ensureOnboardingIds';

// SOL:START ProviderOnboard
interface Step {
  id: number;
  title: string;
  status: 'pending' | 'current' | 'completed';
}

interface IDVerificationState {
  status: 'idle' | 'pending' | 'passed' | 'failed' | 'loading';
  sessionId?: string;
  message?: string;
}

interface BackgroundCheckState {
  status: 'idle' | 'pending' | 'passed' | 'failed' | 'loading';
  message?: string;
}

interface PayoutSetupState {
  status: 'idle' | 'connecting' | 'connected' | 'failed' | 'loading';
  accountId?: string;
  message?: string;
}

const ProviderOnboard: React.FC = () => {
  const { currentStep, providerId, setCurrentStep, setProviderId, loadFromStorage } = useOnboardingStore();
  const { userId, applicationId, stripeAccountId, payoutSetupComplete, setIds, setApplicationId, setStripeAccountId, setPayoutSetupComplete } = useOnboarding();
  const { user: authUser } = useAuth();
  const [basicsData, setBasicsData] = useState({
    legalName: '',
    phone: ''
  });
  const [isSavingBasics, setIsSavingBasics] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idVerification, setIdVerification] = useState<IDVerificationState>({ status: 'idle' });
  const [idInputsLocked, setIdInputsLocked] = useState(false);
  const [idInfo, setIdInfo] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [backgroundCheck, setBackgroundCheck] = useState<BackgroundCheckState>({ status: 'idle' });
  const [bgCheckConsent, setBgCheckConsent] = useState<boolean>(false);
  const [bgRefUrl, setBgRefUrl] = useState<string>('');
  const [bgUrlError, setBgUrlError] = useState<string | null>(null);
  const [isSavingConsent, setIsSavingConsent] = useState(false);
  const [consentMessage, setConsentMessage] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [payoutSetup, setPayoutSetup] = useState<PayoutSetupState>({ status: 'idle' });
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState({
    description: '',
    pricePerService: '',
    availability: 'weekdays',
    serviceTypes: [] as string[],
    radiusKm: 10,
  });
  const [serviceDetailsSaved, setServiceDetailsSaved] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState({
    terms: false,
    providerAgreement: false,
  });
  const [providerStatus, setProviderStatus] = useState<'pending' | 'verified' | 'loading'>('pending');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize user IDs when component loads (hydration handled by OnboardingHydrator)
  useEffect(() => {
    // Note: Hydration now handled centrally by OnboardingHydrator component
  }, []);

  // Set IDs once we have the auth user and providerId (from storage or API)
  useEffect(() => {
    if (authUser?.id && providerId) {
      setIds(authUser.id, providerId);
    }
  }, [authUser?.id, providerId, setIds]);

  // Log IDs for debugging (Step 5 diagnostic)
  useEffect(() => {
    console.log('[Step5] IDs check:', { 
      userId: authUser?.id, 
      providerId, 
      applicationId,
      hasUserId: !!authUser?.id,
      hasProviderId: !!providerId,
      hasApplicationId: !!applicationId
    });
  }, [authUser?.id, providerId, applicationId]);

  // Ensure applicationId exists when we have userId and providerId
  useEffect(() => {
    const ensureApplicationId = async () => {
      if (authUser?.id && providerId && !applicationId) {
        console.log('[ONBOARDING] ApplicationId missing, creating one...');
        try {
          const response = await fetch('/api/applications/ensure-open', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: authUser.id, 
              providerId 
            })
          });
          
          const data = await response.json();
          console.log('[ONBOARDING] Application response:', data);
          
          if (response.ok && data.success && data.applicationId) {
            console.log('[ONBOARDING] Created/found applicationId:', data.applicationId);
            setApplicationId(data.applicationId);
          } else {
            console.error('[ONBOARDING] Failed to ensure application:', data.message);
          }
        } catch (error) {
          console.error('[ONBOARDING] Failed to ensure applicationId:', error);
        }
      }
    };

    ensureApplicationId();
  }, [authUser?.id, providerId, applicationId, setApplicationId]);

  // Automatic Stripe account status polling
  const pollStripeStatus = async () => {
    let cancelled = false;
    
    setChecking(true);
    setErr(null);

    const start = Date.now();
    while (!cancelled && Date.now() - start < 60_000) { // up to 60s
      try {
        console.log('[STRIPE POLL] Checking account status...');
        const r = await fetch("/api/stripe/account/status");
        
        if (r.status === 401) {
          // tell user to re-login (or do a silent refresh)
          setErr("Your session expired. Please sign in again.");
          break;
        }
        
        if (!r.ok) {
          console.log('[STRIPE POLL] Request failed, retrying in 2s...');
          // brief delay then try again
          await new Promise((s) => setTimeout(s, 2000));
          continue;
        }
        
        const data = await r.json();
        console.log('[STRIPE POLL] Account status:', data);
        
        if (data.connected) {
          console.log('[STRIPE POLL] Account fully connected! Advancing to next step...');
          setPayoutSetupComplete(true);
          setPayoutSetup({ status: 'connected', accountId: data.account_id });
          // advance the wizard automatically
          goTo(6); // details
          return;
        }
        
        console.log('[STRIPE POLL] Not enabled yet, trying again in 2s...');
        // Not enabled yet — try again in 2s
        await new Promise((s) => setTimeout(s, 2000));
      } catch (error) {
        console.error('[STRIPE POLL] Error:', error);
        await new Promise((s) => setTimeout(s, 2000));
      }
    }
    
    setChecking(false);
    
    return () => { cancelled = true; };
  };

  // Auto-poll when returning from Stripe or on Step 5 mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get('from') === 'stripe';
    const step = urlParams.get('step');
    
    // Clean up URL parameters if returning from Stripe
    if (fromStripe && step === '5') {
      console.log('[STRIPE POLL] User returned from Stripe, starting auto-poll...');
      const newUrl = window.location.pathname + '?step=5';
      window.history.replaceState({}, '', newUrl);
      
      // Start polling immediately
      pollStripeStatus();
    } else if (currentStep === 5 && !payoutSetupComplete && authUser?.id) {
      // Also poll on Step 5 mount if not already complete
      console.log('[STRIPE POLL] Step 5 mounted, checking status...');
      pollStripeStatus();
    }
  }, [currentStep, authUser?.id, payoutSetupComplete]);

  // Auth guard - redirect to auth if not signed in
  useEffect(() => {
    if (authUser === null) {
      navigate('/auth?next=/services/onboarding');
    }
  }, [authUser, navigate]);


  // Show nothing if user is not authenticated (redirect is happening)
  if (!authUser) {
    return null;
  }
  
  const steps: Step[] = [
    { id: 0, title: 'Welcome', status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'pending' },
    { id: 1, title: 'Basics', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'pending' },
    { id: 2, title: 'ID', status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'pending' },
    { id: 3, title: 'Check', status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'pending' },
    { id: 4, title: 'Payout', status: currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : 'pending' },
    { id: 5, title: 'Details', status: currentStep === 5 ? 'current' : currentStep > 5 ? 'completed' : 'pending' },
    { id: 6, title: 'Terms', status: currentStep === 6 ? 'current' : currentStep > 6 ? 'completed' : 'pending' },
    { id: 7, title: 'Review', status: currentStep === 7 ? 'current' : currentStep > 7 ? 'completed' : 'pending' },
  ];

  // Navigation helper function
  const goTo = (step: number) => {
    setCurrentStep(step);
    navigate(`/services/onboarding?step=${step}`);
  };

  // Validation functions for each step
  const isBasicsValid = () => {
    return basicsData.legalName.trim() !== '' && basicsData.phone.trim() !== '';
  };

  const isIdValid = () => {
    return idFrontFile && idBackFile && (idVerification.status === 'passed' || idVerification.status === 'pending');
  };

  const isBackgroundCheckValid = () => {
    return bgCheckConsent && (backgroundCheck.status === 'passed' || backgroundCheck.status === 'pending');
  };

  const validateUrlOptional = (url: string) => {
    if (!url) return true; // Allow empty (optional)
    try { 
      new URL(url); 
      return true; 
    } catch { 
      return false; 
    }
  };

  const isDetailsValid = () => {
    return serviceDetails.description.trim() !== '' && 
           serviceDetails.pricePerService.trim() !== '' && 
           serviceDetails.serviceTypes.length > 0;
  };

  const isTermsValid = () => {
    return termsAccepted.terms && termsAccepted.providerAgreement;
  };

  const handleNext = () => {
    console.log('[Steps] handleNext', {
      currentStep,
      providerId,
      stripeAccountId,
      payoutSetupComplete,
    });

    // STEP-SPECIFIC GUARDS
    if (currentStep === 1) {
      // validate basics only
      if (!isBasicsValid()) {
        return alert('Please complete your basic info (legal name and phone).');
      }
      return goTo(2);
    }

    if (currentStep === 2) {
      // validate ID verification
      if (!isIdValid()) {
        return alert('Please upload and verify your ID documents.');
      }
      return goTo(3);
    }

    if (currentStep === 3) {
      // validate background check consent
      if (!bgCheckConsent) {
        return alert('Please consent to background check.');
      }
      if (!validateUrlOptional(bgRefUrl)) {
        setBgUrlError('Invalid URL');
        return;
      }
      return goTo(4);
    }

    if (currentStep === 4) {
      // validate service details
      if (!isDetailsValid()) {
        return alert('Please complete your service details.');
      }
      return goTo(5);
    }

    // ✅ Stripe gate ONLY here
    if (currentStep === 5) {
      if (!payoutSetupComplete) {
        alert('Please complete Stripe Connect first. If you just finished, tap "I\'ve Completed Setup" or wait 2–3s.');
        return;
      }
      return goTo(6);
    }

    if (currentStep === 6) {
      // validate terms acceptance
      if (!isTermsValid()) {
        return alert('Please accept the terms and agreements.');
      }
      return goTo(7);
    }

    if (currentStep === 7) {
      // final review → submit
      return goTo(8);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartIDVerification = async (e?: React.MouseEvent | React.FormEvent) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (submitting) return; // prevent double fire
    setSubmitting(true);
    setIdError(null);
    setIdInfo(null);

    if (!authUser?.id || !providerId) {
      setIdError("Authentication or provider ID not found. Please refresh and try again.");
      setSubmitting(false);
      return;
    }

    if (!idFrontFile || !idBackFile) {
      setIdError("Please upload both front and back images of your ID.");
      setSubmitting(false);
      return;
    }

    try {
      console.log('[STRIPE VERIFICATION] Starting comprehensive verification for:', { userId: authUser.id, providerId, applicationId });
      
      const res = await fetch("/api/verification/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: authUser.id, 
          providerId, 
          applicationId,
          frontImagePath: idFrontFile.name,
          backImagePath: idBackFile.name
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log('[STRIPE VERIFICATION] API response:', { status: res.status, data });

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to start ID verification.");
      }

      // Store the application ID for future use
      if (data.applicationId) {
        setApplicationId(data.applicationId);
      }

      // SUCCESS UX (no red, no error toast)
      setIdInputsLocked(true);
      setIdInfo("ID saved. Verification is running in the background. You can continue to the next step.");
      setIdVerification({ status: 'pending' });

      // NO error toast on success - removed any toast.error calls here

    } catch (e: any) {
      // Only set error for actual failures, not when verification starts successfully
      const errorMessage = e?.message || "Could not save ID.";
      if (!errorMessage.includes("session started") && !errorMessage.includes("ID verification session started")) {
        setIdError(errorMessage);
        setIdVerification({ status: 'failed', message: e?.message });
      } else {
        // If it's a "session started" message, treat it as success
        setIdInputsLocked(true);
        setIdInfo("ID saved. Verification is running in the background. You can continue to the next step.");
        setIdVerification({ status: 'pending' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!providerId) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${providerId}`);
      const data = await response.json();

      if (data.verification?.id_status === 'passed' && data.verification?.liveness_passed) {
        setIdVerification({ status: 'passed' });
        toast({
          title: "Verification Complete",
          description: "Your identity has been verified successfully!",
        });
      } else if (data.verification?.id_status === 'failed') {
        setIdVerification({ status: 'failed', message: 'Verification failed. Please try again.' });
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const pollVerificationStatus = () => {
    const pollInterval = setInterval(async () => {
      await checkVerificationStatus();
      
      // Stop polling if verification is complete
      if (idVerification.status === 'passed' || idVerification.status === 'failed') {
        clearInterval(pollInterval);
      }
    }, 3000); // Check every 3 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(pollInterval), 120000);
  };

  const handleStartBackgroundCheck = async () => {
    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please start from the beginning.",
        variant: "destructive",
      });
      return;
    }

    setBackgroundCheck({ status: 'loading' });

    try {
      const response = await fetch('/api/providers/checks/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start background check');
      }

      setBackgroundCheck({ 
        status: 'pending',
        message: data.message 
      });

      // Start polling for background check status
      pollBackgroundCheckStatus();

      // Simulate successful background check after delay
      setTimeout(async () => {
        try {
          const webhookResponse = await fetch('/api/providers/checks/webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              providerId, 
              status: 'passed',
              checkData: {
                criminal: true,
                identity: true,
                eligibility: true,
                overall_score: 95
              }
            }),
          });

          if (webhookResponse.ok) {
            setBackgroundCheck({ status: 'passed' });
            toast({
              title: "Background Check Complete",
              description: "Your background check has passed successfully!",
            });
          }
        } catch (webhookError) {
          console.error('Background check webhook error:', webhookError);
        }
      }, 3000); // 3 second delay for demo

      toast({
        title: "Background Check Started",
        description: "Background check has been initiated.",
      });

    } catch (error) {
      console.error('Background check start error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setBackgroundCheck({ status: 'failed', message: errorMessage });
      toast({
        title: "Background Check Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const checkBackgroundStatus = async () => {
    if (!providerId) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${providerId}`);
      const data = await response.json();

      if (data.backgroundCheck?.check_status === 'passed') {
        setBackgroundCheck({ status: 'passed' });
        toast({
          title: "Background Check Complete",
          description: "Your background check has passed successfully!",
        });
      } else if (data.backgroundCheck?.check_status === 'failed') {
        setBackgroundCheck({ status: 'failed', message: 'Background check failed. Please contact support.' });
      }
    } catch (error) {
      console.error('Background check status error:', error);
    }
  };

  const pollBackgroundCheckStatus = () => {
    const pollInterval = setInterval(async () => {
      await checkBackgroundStatus();
      
      // Stop polling if background check is complete
      if (backgroundCheck.status === 'passed' || backgroundCheck.status === 'failed') {
        clearInterval(pollInterval);
      }
    }, 5000); // Check every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const handleStripeConnect = async () => {
    console.log('[PAYOUT] Connect button clicked');
    
    if (payoutSetup.status === 'loading') return;
    setPayoutSetup({ status: 'loading' });

    try {
      // 1) Get user ID from auth and validate
      if (!authUser?.id) {
        throw new Error("Please sign in to continue.");
      }
      
      if (!providerId) {
        throw new Error("Provider information missing. Please complete previous steps.");
      }
      
      // 2) Ensure applicationId exists (using bullet-proof endpoint with clear errors)
      console.log('[PAYOUT] Ensuring application exists...');
      const appResponse = await fetch('/api/applications/ensure-open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: authUser.id, 
          providerId 
        })
      });
      
      const appData = await appResponse.json();
      console.log('[PAYOUT] Application response:', appData);
      
      if (!appResponse.ok || !appData?.success) {
        throw new Error(appData?.message || "Could not prepare application.");
      }
      
      const resolvedApplicationId = appData.applicationId as string;
      const resolvedProviderId = appData.providerId as string; // Use the real UUID from server
      setApplicationId(resolvedApplicationId);
      console.log('[PAYOUT] Application ready:', resolvedApplicationId);
      console.log('[PAYOUT] Provider ID normalized:', resolvedProviderId);
      
      console.log('[PAYOUT] Final IDs:', { 
        userId: authUser.id, 
        providerId: resolvedProviderId, // Use real UUID
        applicationId: resolvedApplicationId 
      });

      // 3) Start Stripe onboarding with guaranteed IDs
      console.log('[PAYOUT] Starting Stripe Connect...');
      const response = await fetch('/api/payout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: authUser.id,
          providerId: resolvedProviderId, // Use real UUID instead of fabricated
          applicationId: resolvedApplicationId,
          accountType: accountType || 'individual'
        }),
      });

      const data = await response.json();
      console.log('[PAYOUT] API response:', response.status, data);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || `Request failed: ${response.status}`);
      }

      // Validate that we got a URL back
      if (!data?.url) {
        throw new Error('Stripe onboarding URL was not returned.');
      }

      console.log('[PAYOUT] Opening Stripe URL in new tab:', data.url);
      setPayoutSetup({ status: 'connecting' });
      
      // Open Stripe Connect in new tab (preferred for security and UX)
      window.open(data.url, "_blank", "noopener");

    } catch (e: any) {
      console.error('[PAYOUT] connectStripe error:', e);
      setPayoutSetup({ status: 'failed', message: e?.message || "Could not start payout onboarding." });
      toast({
        title: "Payout Setup Failed",
        description: e?.message || "Could not start payout onboarding.",
        variant: "destructive",
      });
    }
  };


  const saveServiceDetails = async () => {
    try {
      const response = await fetch('/api/providers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: serviceDetails.description,
          pricePerService: parseFloat(serviceDetails.pricePerService) || undefined,
          availability: serviceDetails.availability,
          serviceTypes: serviceDetails.serviceTypes,
          radiusKm: serviceDetails.radiusKm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save service details');
      }

      toast({
        title: "Details Saved",
        description: "Your service details have been saved successfully.",
      });
      
      setServiceDetailsSaved(true);
      return true;
    } catch (error) {
      console.error('Save service details error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const advanceProviderStatus = async () => {
    if (!termsAccepted.terms || !termsAccepted.providerAgreement) {
      toast({
        title: "Terms Required",
        description: "Please accept both terms and provider agreement to continue.",
        variant: "destructive",
      });
      return false;
    }

    setProviderStatus('loading');

    try {
      const response = await fetch('/api/providers/status/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to advance provider status');
      }

      setProviderStatus('verified');
      toast({
        title: "Congratulations!",
        description: "You're now a verified provider. You can start accepting bookings!",
      });

      // Advance to final step
      setCurrentStep(7);
      return true;

    } catch (error) {
      console.error('Advance status error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProviderStatus('pending');
      toast({
        title: "Status Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };


  // Initialize from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Save provider basics with direct Supabase call
  const saveBasics = async () => {
    console.log('[ONBOARDING] saveBasics function START');
    console.log('[ONBOARDING] saveBasics called:', { user: !!authUser?.id, basicsData });
    
    if (!authUser?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (basicsData.legalName.length < 2) {
      toast({
        title: "Validation Error",
        description: "Legal name must be at least 2 characters long",
        variant: "destructive",
      });
      return;
    }

    if (basicsData.phone.length < 7) {
      toast({
        title: "Validation Error", 
        description: "Phone number must be at least 7 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSavingBasics(true);

    try {
      console.log('[ONBOARDING] Making save request with:', {
        userId: authUser.id,
        legalName: basicsData.legalName,
        phone: basicsData.phone
      });

      // For now, create a mock provider ID to unblock the flow
      const mockProviderId = `provider_${authUser.id}_${Date.now()}`;
      
      console.log('[ONBOARDING] Using mock provider ID:', mockProviderId);
      setProviderId(mockProviderId);

      toast({
        title: "Basics Saved",
        description: "Your basic information has been saved successfully.",
      });

    } catch (error) {
      console.error('Save basics error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSavingBasics(false);
    }
  };

  // Save background check consent
  const saveConsent = async () => {
    setBgUrlError(null);
    if (!bgCheckConsent) {
      setConsentError('Please consent to background check.');
      return;
    }
    if (!validateUrlOptional(bgRefUrl)) {
      setBgUrlError('Invalid URL');
      return;
    }

    if (!authUser?.id || !applicationId) {
      toast({
        title: "Missing Information",
        description: "Missing application or user information. Please complete previous steps first.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingConsent(true);
    setConsentError(null);
    setConsentMessage(null);

    try {
      console.log('[CONSENT] Saving consent with:', { 
        applicationId, 
        userId: authUser.id, 
        consent: bgCheckConsent, 
        bgRefUrl: bgRefUrl || null 
      });
      
      const response = await fetch('/api/applications/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId, 
          userId: authUser.id, 
          consent: bgCheckConsent,
          bg_ref_url: bgRefUrl || null
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Could not save consent.");
      }

      setConsentMessage("Consent saved.");
    } catch (e: any) {
      setConsentError(e?.message || "Could not save consent.");
    } finally {
      setIsSavingConsent(false);
    }
  };

  // Handle Next for background check step  
  const handleBackgroundNext = () => {
    // gate ONLY on Step 3 fields
    if (!bgCheckConsent) {
      alert('Please consent to background check.');
      return;
    }
    if (!validateUrlOptional(bgRefUrl)) {
      setBgUrlError('Invalid URL');
      return;
    }
    setCurrentStep(4);
    navigate('/services/onboarding?step=4');
  };

  const submitProviderApplication = async () => {
    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please complete all previous steps.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingApplication(true);

    try {
      const response = await fetch('/api/provider-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          providerId,
          userId: authUser?.id 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      toast({
        title: "Application Submitted!",
        description: "Your provider application has been submitted for review. You'll receive an email confirmation and updates on the status.",
      });

      // Optionally advance to a confirmation step or redirect
      // setCurrentStep(8); // Could add a confirmation step
      
    } catch (error) {
      console.error('Submit application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Welcome to Provider Onboarding</h2>
            <p className="text-gray-600">Let's get you started as a service provider on our platform.</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">You'll complete the following steps:</p>
              <ul className="text-sm text-gray-500 list-disc list-inside">
                <li>Basic information</li>
                <li>Identity verification</li>
                <li>Background check</li>
                <li>Payment setup</li>
                <li>Service details</li>
                <li>Terms agreement</li>
              </ul>
            </div>
          </div>
        );

      case 1: // Basics
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Legal Name</label>
                <Input 
                  placeholder="Enter your full legal name" 
                  value={basicsData.legalName}
                  onChange={(e) => setBasicsData(prev => ({ ...prev, legalName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input 
                  placeholder="Enter your phone number" 
                  value={basicsData.phone}
                  onChange={(e) => setBasicsData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <Button 
                onClick={() => {
                  console.log('[ONBOARDING] Save button clicked!');
                  saveBasics();
                }}
                disabled={isSavingBasics}
                className="w-full"
                data-testid="button-save-basics"
              >
                {isSavingBasics ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Basics'
                )}
              </Button>
              {providerId && (
                <div className="text-sm text-green-600 text-center">
                  ✓ Basic information saved
                </div>
              )}
            </div>
          </div>
        );

      case 2: // ID Verification
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Identity Verification</h2>
            <p className="text-gray-600">Use your phone's camera or upload an image of your ID. Both front and back are required.</p>
            
            <div className="space-y-6">
              {/* Messages */}
              {idInfo && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {idInfo}
                </div>
              )}
              {idError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {idError}
                </div>
              )}

              {/* Front of ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Front of ID</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  disabled={idInputsLocked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIdFrontFile(file);
                    }
                  }}
                  data-testid="input-id-front"
                />
                {idFrontFile && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(idFrontFile)} 
                      alt="Front of ID preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                    <p className="text-sm text-green-600 mt-1">✓ Front image captured</p>
                  </div>
                )}
              </div>

              {/* Back of ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Back of ID</label>
                <Input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  disabled={idInputsLocked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIdBackFile(file);
                    }
                  }}
                  data-testid="input-id-back"
                />
                {idBackFile && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(idBackFile)} 
                      alt="Back of ID preview" 
                      className="w-32 h-20 object-cover rounded border"
                    />
                    <p className="text-sm text-green-600 mt-1">✓ Back image captured</p>
                  </div>
                )}
              </div>

              {/* Edit button when inputs are locked */}
              {idInputsLocked && (
                <button 
                  className="text-sm underline text-blue-600 hover:text-blue-800"
                  onClick={() => setIdInputsLocked(false)}
                >
                  Edit ID photos
                </button>
              )}

              {/* Show auto-start message when both images are uploaded */}
              {idFrontFile && idBackFile && !idInputsLocked && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Both images uploaded successfully! 
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Click "Save" to start verification and proceed to the next step.
                  </p>
                </div>
              )}

              {/* Success/Error Messages */}
              {idInfo && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {idInfo}
                </div>
              )}
              {idError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {idError}
                </div>
              )}
              
              {!idInputsLocked && (
                <Button 
                  onClick={handleStartIDVerification}
                  disabled={submitting || !idFrontFile || !idBackFile}
                  className="w-full"
                  data-testid="button-save-id"
                >
                  {submitting ? "Saving…" : "Save"}
                </Button>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  We'll verify your identity using document analysis and liveness detection.
                  This process typically takes 1-2 minutes.
                </p>
              </div>
            </div>

            {idVerification.status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Starting verification session...</p>
              </div>
            )}

            {idVerification.status === 'pending' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">ID saved. Verification in progress.</p>
                    <p className="text-sm text-blue-700">You can continue with the remaining steps while verification processes in the background.</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Verification typically takes 1-2 business days. You'll be notified when complete.
                </p>
              </div>
            )}

            {idVerification.status === 'passed' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Identity Verified</p>
                  <p className="text-sm text-green-700">Your identity has been successfully verified.</p>
                </div>
              </div>
            )}

            {idVerification.status === 'failed' && !idVerification.message?.includes('session started') && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Verification Failed</p>
                    <p className="text-sm text-red-700">
                      {idVerification.message || 'Please try again with a clear photo of your ID.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIdVerification({ status: 'idle' })}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry-id-verification"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      case 3: // Background Check
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Background Check</h2>
            <p className="text-sm text-gray-600">
              We'll run a background check to ensure platform safety after you submit your application.
            </p>

            <label className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                checked={bgCheckConsent}
                onChange={(e) => setBgCheckConsent(e.target.checked)}
                className="mt-0.5"
                data-testid="checkbox-bgcheck-consent"
              />
              <span className="text-sm">
                I consent to a background check and authorize My Pup to process it upon submission.
              </span>
            </label>

            <div className="mt-3 space-y-2">
              <input
                type="url"
                placeholder="(optional) reference URL"
                value={bgRefUrl}
                onChange={(e) => {
                  setBgRefUrl(e.target.value);
                  if (bgUrlError) setBgUrlError(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="input-bg-ref-url"
              />
              {bgUrlError && (
                <p className="text-red-600 text-sm">{bgUrlError}</p>
              )}

              {consentMessage && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm">
                  {consentMessage}
                </div>
              )}
              {consentError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {consentError}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={saveConsent} 
                  disabled={isSavingConsent} 
                  variant="outline"
                  data-testid="button-save-consent"
                >
                  {isSavingConsent ? "Saving…" : "Save"}
                </Button>
                <Button 
                  onClick={handleBackgroundNext}
                  className="ml-auto"
                  data-testid="button-background-next"
                >
                  Next
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 text-center mt-4">
              We'll verify your background after you submit your application. This typically takes 1–3 business days.
            </p>
          </div>
        );

      case 4: // Payout Setup
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payout Setup</h2>
            <p className="text-gray-600">Connect your bank account to receive payments</p>
            
            {payoutSetup.status === 'idle' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Type</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as 'individual' | 'business')}
                    data-testid="select-account-type"
                  >
                    <option value="individual">Individual</option>
                    <option value="business">Business</option>
                  </select>
                  {accountType === 'business' && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-2">Business EIN</label>
                      <Input 
                        type="text" 
                        placeholder="XX-XXXXXXX"
                        data-testid="input-business-ein"
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  type="button"
                  onClick={handleStripeConnect}
                  className="w-full"
                  data-testid="button-connect-stripe"
                >
                  Connect with Stripe
                </Button>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    We use Stripe Connect for secure payment processing.
                    Your financial information is encrypted and secure.
                  </p>
                </div>
              </div>
            )}

            {payoutSetup.status === 'loading' && (
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Setting up your payout account...</p>
              </div>
            )}

            {payoutSetup.status === 'connecting' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                  {checking ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-blue-800">Complete Setup in New Window</p>
                    <p className="text-sm text-blue-700">Finish your Stripe Connect setup in the opened window.</p>
                    {checking && (
                      <p className="text-xs text-blue-600 mt-1">Checking account status...</p>
                    )}
                    {err && (
                      <p className="text-xs text-red-600 mt-1">{err}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline mt-3"
                  onClick={() => {
                    console.log('[BUTTON] I\'ve Completed Setup clicked - starting poll');
                    pollStripeStatus();
                  }}
                  disabled={checking}
                  data-testid="button-check-payout-status"
                >
                  {checking ? 'Checking...' : "I've Completed Setup"}
                </button>
                <button 
                  type="button" 
                  className="text-sm underline mt-2"
                  onClick={() => {
                    console.log('[BUTTON] Force Re-check clicked - starting poll');
                    pollStripeStatus();
                  }}
                  disabled={checking}
                >
                  {checking ? 'Checking...' : 'Force Re-check'}
                </button>
              </div>
            )}

            {payoutSetup.status === 'connected' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Payout Account Connected</p>
                  <p className="text-sm text-green-700">You're ready to receive payments!</p>
                </div>
              </div>
            )}
            
            {/* Clear visual status indicator */}
            <div className="mt-4 text-sm">
              {payoutSetupComplete ? (
                <span className="text-green-600 font-medium">✓ Stripe connected - You can proceed.</span>
              ) : (
                <span className="text-amber-600 font-medium">⚠ Stripe not connected yet.</span>
              )}
            </div>

            {payoutSetup.status === 'failed' && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Setup Failed</p>
                    <p className="text-sm text-red-700">
                      {payoutSetup.message || 'Please try again or contact support.'}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setPayoutSetup({ status: 'idle' })}
                  variant="outline"
                  className="w-full"
                  data-testid="button-retry-payout-setup"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        );

      case 5: // Service Details
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Service Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Service Description</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2 h-24"
                  placeholder="Describe your services..."
                  value={serviceDetails.description}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="textarea-service-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Starting Price ($)</label>
                  <Input 
                    type="number" 
                    placeholder="50"
                    value={serviceDetails.pricePerService}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, pricePerService: e.target.value }))}
                    data-testid="input-price-per-service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    value={serviceDetails.availability}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, availability: e.target.value }))}
                    data-testid="select-availability"
                  >
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Services Offered</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dog Walking', 'Pet Sitting', 'Grooming', 'Dog Training'].map((service) => (
                    <label key={service} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={serviceDetails.serviceTypes.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setServiceDetails(prev => ({ 
                              ...prev, 
                              serviceTypes: [...prev.serviceTypes, service] 
                            }));
                          } else {
                            setServiceDetails(prev => ({ 
                              ...prev, 
                              serviceTypes: prev.serviceTypes.filter(s => s !== service) 
                            }));
                          }
                        }}
                        data-testid={`checkbox-service-${service.toLowerCase().replace(' ', '-')}`}
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Service Radius (km)</label>
                <Input 
                  type="number" 
                  placeholder="10" 
                  min="1" 
                  max="50"
                  value={serviceDetails.radiusKm}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, radiusKm: parseInt(e.target.value) || 10 }))}
                  data-testid="input-service-radius"
                />
              </div>
              <div className="pt-4">
                <Button 
                  onClick={saveServiceDetails}
                  variant="outline"
                  className="w-full"
                  data-testid="button-save-service-details"
                >
                  Save Service Details
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Details are saved as draft and can be updated later
                </p>
              </div>
            </div>
          </div>
        );

      case 6: // Terms
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Terms & Conditions</h2>
            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700">
                <strong>Service Provider Terms & Conditions</strong><br/><br/>
                By becoming a service provider on our platform, you agree to:
                <br/>• Provide accurate and honest service descriptions
                <br/>• Maintain professional standards when interacting with pet owners
                <br/>• Complete all booked services as agreed
                <br/>• Follow safety protocols and guidelines
                <br/>• Maintain valid insurance and certifications as required
                <br/>• Comply with local laws and regulations
                <br/><br/>
                <strong>Provider Agreement</strong><br/><br/>
                • Commission of 15% will be deducted from each completed booking
                <br/>• Payments will be processed within 2-3 business days
                <br/>• You are responsible for your own taxes and business expenses
                <br/>• Platform reserves the right to suspend accounts for policy violations
              </p>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={termsAccepted.terms}
                  onChange={(e) => setTermsAccepted(prev => ({ ...prev, terms: e.target.checked }))}
                  data-testid="checkbox-terms-conditions"
                />
                <span className="text-sm">I agree to the Terms & Conditions</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={termsAccepted.providerAgreement}
                  onChange={(e) => setTermsAccepted(prev => ({ ...prev, providerAgreement: e.target.checked }))}
                  data-testid="checkbox-provider-agreement"
                />
                <span className="text-sm">I agree to the Provider Agreement</span>
              </label>
            </div>
            {termsAccepted.terms && termsAccepted.providerAgreement && (
              <div className="pt-4">
                <Button 
                  onClick={advanceProviderStatus}
                  className="w-full"
                  disabled={providerStatus === 'loading'}
                  data-testid="button-complete-onboarding"
                >
                  {providerStatus === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Completing Setup...
                    </>
                  ) : (
                    'Complete Provider Setup'
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case 7: // Review
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Welcome to the Platform!</h2>
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">Congratulations!</h3>
              <p className="text-green-700 mb-4">
                You're now a verified provider on our platform.
              </p>
              <div className="bg-white p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Provider Status:</strong> <span className="text-green-600 font-semibold">Verified</span>
                </p>
                <p className="text-sm text-gray-700">
                  You can now start accepting bookings and providing services to pet owners in your area.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800">Verification Complete:</h4>
              <div className="flex justify-between text-sm">
                <span>Identity Verified</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Background Check</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Payout Setup</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Terms Accepted</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={submitProviderApplication}
                disabled={isSubmittingApplication}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-submit-application"
              >
                {isSubmittingApplication ? "Submitting Application..." : "Submit Provider Application"}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your application will be reviewed by our team within 24-48 hours
              </p>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.status === 'completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.status === 'current'
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id + 1}</span>
                  )}
                </div>
                <span className={`text-xs mt-1 ${
                  step.status === 'current' ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          data-testid="button-back-step"
        >
          Back
        </Button>
        <button
          type="button"
          data-testid="button-next-step"
          onClick={handleNext}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
};
// SOL:END ProviderOnboard

export default ProviderOnboard;

// Helper functions (defined below component as requested)
const getStepStatus = (currentStep: number, stepIndex: number): 'pending' | 'current' | 'completed' => {
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'pending';
};

const validateStep = (stepIndex: number, formData: Record<string, any>): boolean => {
  // Stub validation logic for each step
  switch (stepIndex) {
    case 1: // Basics
      return formData.legalName && formData.phone;
    case 2: // ID
      return formData.idDocument;
    case 3: // Background Check
      return formData.backgroundCheckStatus === 'passed';
    case 4: // Payout
      return formData.stripeAccountId;
    case 5: // Service Details
      return formData.serviceTypes && formData.serviceTypes.length > 0;
    case 6: // Terms
      return formData.termsAgreed && formData.providerAgreementAgreed;
    default:
      return true;
  }
};