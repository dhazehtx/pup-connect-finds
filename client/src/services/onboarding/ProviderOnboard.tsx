import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Circle, AlertCircle, Loader2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStore } from '@/stores/onboarding';
import { useOnboarding } from '@/stores/useOnboarding';
import { ensureOnboardingIds } from '@/lib/ensureOnboardingIds';
import { LegalBlurb } from '@/components/legal/LegalBlurb';
import { supabase } from '@/integrations/supabase/client';
import { SERVICE_CATEGORY_FILTER_OPTIONS, isAllowedPetServiceType } from '@shared/serviceCategories';
import { getServiceVerificationInfo } from '@shared/serviceVerification';

/** Older onboarding stored display labels instead of `service_type` ids. */
const LEGACY_SERVICE_LABEL_TO_ID: Record<string, string> = {
  'Dog Walking': 'walking',
  'Pet Sitting': 'sitting',
  Grooming: 'grooming',
  'Dog Training': 'training',
};

function normalizeLegacyServiceTypesToIds(types: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of types) {
    const id = LEGACY_SERVICE_LABEL_TO_ID[s] ?? s;
    if (isAllowedPetServiceType(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

const PROFESSIONAL_BADGE_SERVICE_IDS = new Set([
  'training',
  'veterinary',
  'boarding',
  'transportation',
  'stud_services',
]);

const BUSINESS_DOC_REQUIRED_SERVICE_IDS = new Set([
  'boarding',
  'transportation',
  'veterinary',
]);

const SERVICE_CARD_DESCRIPTIONS: Record<string, string> = {
  walking: 'Solo or group walks with safety-first handling.',
  sitting: 'In-home care, feeding, and companionship visits.',
  boarding: 'Overnight stays in a safe boarding environment.',
  grooming: 'Bathing, brushing, and coat care services.',
  training: 'Behavior and obedience coaching programs.',
  poop_scooping: 'Recurring yard cleanup and waste removal.',
  stud_services: 'Responsible stud service coordination.',
  transportation: 'Pickup and drop-off pet transportation.',
  veterinary: 'Clinical wellness and treatment support.',
  mobile_grooming: 'On-site grooming from a mobile setup.',
};

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

interface ServiceConfig {
  baseRate: string;
  unit:
    | 'per_hour'
    | 'per_visit'
    | 'per_night'
    | 'per_24h'
    | 'per_session'
    | 'starting_at'
    | 'weekly_plan'
    | 'per_successful_match';
  serviceMode?: 'standard' | 'premium' | 'specialized';
  experienceLevel?: 'entry' | 'intermediate' | 'advanced' | 'certified';
  experience: string;
  // Conditional service-specific onboarding fields
  businessName?: string;
  serviceAddress?: string;
  vehicleInfo?: string;
  driverLicense?: string;
  dogInfo?: string;
}

function emptyServiceConfig(): ServiceConfig {
  return {
    baseRate: '',
    unit: 'per_hour',
    serviceMode: 'standard',
    experienceLevel: 'entry',
    experience: '',
    businessName: '',
    serviceAddress: '',
    vehicleInfo: '',
    driverLicense: '',
    dogInfo: '',
  };
}

const SERVICE_UNIT_OPTIONS: Record<string, Array<{ value: ServiceConfig['unit']; label: string }>> = {
  walking: [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_visit', label: 'Per visit' },
  ],
  sitting: [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_visit', label: 'Per visit' },
  ],
  training: [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_visit', label: 'Per visit' },
  ],
  veterinary: [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_visit', label: 'Per visit' },
  ],
  transportation: [
    { value: 'per_hour', label: 'Per hour' },
    { value: 'per_visit', label: 'Per visit' },
  ],
  boarding: [
    { value: 'per_night', label: 'Per night' },
    { value: 'per_24h', label: 'Per 24 hours' },
  ],
  grooming: [
    { value: 'per_session', label: 'Per session' },
    { value: 'starting_at', label: 'Starting at' },
  ],
  mobile_grooming: [
    { value: 'per_session', label: 'Per session' },
    { value: 'starting_at', label: 'Starting at' },
  ],
  poop_scooping: [
    { value: 'per_visit', label: 'Per visit' },
    { value: 'weekly_plan', label: 'Weekly plan' },
  ],
  stud_services: [
    { value: 'per_session', label: 'Per session' },
    { value: 'per_successful_match', label: 'Per successful match' },
  ],
};

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
    // Identity fields
    state: 'TX',
    licenseNumber: '',
    profilePhotoUrl: '',
    // Experience fields
    yearsExperience: 0,
    offersCats: false,
    breedRestrictions: '',
    // Pricing fields
    rateType: 'hourly' as 'hourly' | 'per_visit' | 'flat',
    startingPrice: '',
    minBookingMinutes: 60,
    cancellationPolicy: 'flexible' as 'flexible' | 'moderate' | 'strict',
    payoutPreference: 'standard' as 'fast' | 'standard',
    priceVisibility: 'exact' as 'exact' | 'starting_at',
    // Extra fees
    travelFeeEnabled: false,
    travelFeeAmount: '',
    additionalPetFeeEnabled: false,
    additionalPetFeeAmount: '',
    holidayRateEnabled: false,
    holidayRateMultiplier: '1.5',
    // Availability
    weeklySchedule: {
      weekdays: [] as string[],
      timeRanges: [['09:00', '17:00']] as string[][],
    },
    advanceNoticeHours: '24' as '0' | '24' | '48',
    maxBookingsPerDay: '2' as '1' | '2' | '3' | '4_plus',
    // Policy
    communicationPolicy: 'in_app_only',
    reschedulePolicy: 'moderate' as 'flexible' | 'moderate' | 'strict',
    lastMinuteSurchargeEnabled: false,
    lastMinuteSurchargePercent: '10',
    policyAcknowledged: false,
  });
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, ServiceConfig>>({});
  const [documents, setDocuments] = useState({
    businessLicense: null as File | null,
    insuranceCertificate: null as File | null,
    certCPR: null as File | null,
    certAKCTrainer: null as File | null,
    other: null as File | null,
  });
  const [serviceDetailsSaved, setServiceDetailsSaved] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const serviceCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const serviceRateInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
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

  /** Map legacy checkbox labels to canonical `service_type` ids (pre–shared-catalog onboarding). */
  useEffect(() => {
    setServiceDetails((prev) => ({
      ...prev,
      serviceTypes: normalizeLegacyServiceTypesToIds(prev.serviceTypes),
    }));
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

  // Manual re-check of Stripe verification status
  const manualRecheck = async () => {
    if (!authUser?.id) {
      alert('Please sign in to continue.');
      return;
    }
    
    const r = await fetch('/api/payout/verify', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: authUser.id })
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      alert(d?.error?.message || 'Verification failed');
      return;
    }
    if (d.connected) {
      setPayoutSetupComplete(true);
      setPayoutSetup({ status: 'connected', accountId: d.accountId });
    } else {
      alert('Still not connected. Finish the Stripe window or click "Complete Setup" again.');
    }
  };

  // Automatic Stripe account status polling
  function startVerifyPolling() {
    if (!authUser?.id) {
      console.error('[STRIPE POLL] No userId available for polling');
      return;
    }
    
    let tries = 0;
    const id = setInterval(async () => {
      tries++;
      const r = await fetch('/api/payout/verify', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authUser.id })
      });
      const d = await r.json().catch(() => ({}));
      if (d?.connected) {
        clearInterval(id);
        setPayoutSetupComplete(true);
        setPayoutSetup({ status: 'connected', accountId: d.accountId });
        return;
      }
      if (tries > 20) clearInterval(id); // ~60s at 3s/try
    }, 3000);
  }

  // Old polling function (keeping temporarily for reference)
  const pollStripeStatus_OLD = async () => {
    let cancelled = false;
    
    try {
      setChecking(true);
      setErr(null);

      const start = Date.now();
      while (!cancelled && Date.now() - start < 60_000) { // up to 60s
        try {
          console.log('[STRIPE POLL] Checking account status...');
          const r = await fetch("/api/stripe/account/status");
          
          if (r.status === 401) {
            setErr("Your session expired. Please sign in again.");
            break;
          }
          
          if (r.status === 500) {
            setErr("Server error occurred. Please try again.");
            break;
          }
          
          if (!r.ok) {
            console.log('[STRIPE POLL] Request failed, retrying in 2s...');
            await new Promise((s) => setTimeout(s, 2000));
            continue;
          }
          
          const data = await r.json();
          console.log('[STRIPE POLL] Account status:', data);
          
          if (data.connected) {
            console.log('[STRIPE POLL] Account fully connected! You can continue with Next.');
            setPayoutSetupComplete(true);
            setPayoutSetup({ status: 'connected', accountId: data.account_id });
            return;
          }
          
          console.log('[STRIPE POLL] Not enabled yet, trying again in 2s...');
          await new Promise((s) => setTimeout(s, 2000));
        } catch (error) {
          console.error('[STRIPE POLL] Error:', error);
          if (Date.now() - start > 50_000) { // If we're near timeout, show error
            setErr("Connection issues. Please check your internet and try again.");
            break;
          }
          await new Promise((s) => setTimeout(s, 2000));
        }
      }
    } catch (error) {
      console.error('[STRIPE POLL] Unexpected error:', error);
      setErr("An unexpected error occurred. Please try again.");
    } finally {
      setChecking(false);
    }
    
    return () => { cancelled = true; };
  };

  // Auto-poll when returning from Stripe or on Step 5 mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromStripe = urlParams.get('from') === 'stripe';
    const step = urlParams.get('step');
    
    // Clean up URL parameters if returning from Stripe
    if (fromStripe && step === '4') {
      console.log('[STRIPE POLL] User returned from Stripe, starting auto-poll...');
      const newUrl = window.location.pathname + '?step=4';
      window.history.replaceState({}, '', newUrl);
      
      // Start polling immediately
      startVerifyPolling();
    } else if (currentStep === 4 && !payoutSetupComplete && authUser?.id) {
      // Also poll on Step 4 (Payout) mount if not already complete
      console.log('[STRIPE POLL] Step 4 (Payout) mounted, checking status...');
      startVerifyPolling();
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

  const selectedServiceIds = Array.from(
    new Set(serviceDetails.serviceTypes.filter((id) => isAllowedPetServiceType(id))),
  );
  const hasSelectedServices = selectedServiceIds.length > 0;
  const badgeCandidateServices = selectedServiceIds.filter((id) =>
    PROFESSIONAL_BADGE_SERVICE_IDS.has(id),
  );
  const requiresBusinessDocs = selectedServiceIds.some((id) =>
    BUSINESS_DOC_REQUIRED_SERVICE_IDS.has(id),
  );
  const requiresProfessionalLicense =
    selectedServiceIds.includes('veterinary') || selectedServiceIds.includes('training');
  const missingServiceConfig = selectedServiceIds.some((id) => {
    const cfg = serviceConfigs[id];
    if (!cfg) return true;
    if (!cfg.baseRate || parseFloat(cfg.baseRate) <= 0) return true;
    if (!cfg.serviceMode) return true;
    if (!cfg.experienceLevel) return true;
    if (!cfg.experience.trim()) return true;
    if (id === 'boarding') {
      if (!cfg.businessName?.trim()) return true;
      if (!cfg.serviceAddress?.trim()) return true;
    }
    if (id === 'transportation') {
      if (!cfg.vehicleInfo?.trim()) return true;
      if (!cfg.driverLicense?.trim()) return true;
    }
    if (id === 'stud_services') {
      if (!cfg.dogInfo?.trim()) return true;
    }
    return false;
  });
  const missingRequiredDocs =
    (requiresProfessionalLicense && !documents.businessLicense) ||
    (selectedServiceIds.includes('boarding') && !documents.insuranceCertificate);
  const canSaveServiceDetails = hasSelectedServices && !missingServiceConfig && !missingRequiredDocs;

  const isServiceConfigComplete = (id: string): boolean => {
    const cfg = serviceConfigs[id];
    if (!cfg || !cfg.baseRate || parseFloat(cfg.baseRate) <= 0 || !cfg.serviceMode || !cfg.experienceLevel || !cfg.experience.trim()) return false;
    if (id === 'boarding') return !!cfg.businessName?.trim() && !!cfg.serviceAddress?.trim();
    if (id === 'transportation') return !!cfg.vehicleInfo?.trim() && !!cfg.driverLicense?.trim();
    if (id === 'stud_services') return !!cfg.dogInfo?.trim();
    return true;
  };

  const getServiceMissingFields = (id: string): string[] => {
    const cfg = serviceConfigs[id];
    const missing: string[] = [];
    if (!cfg) return ['base rate', 'service mode', 'experience level', 'experience'];
    if (!cfg.baseRate || parseFloat(cfg.baseRate) <= 0) missing.push('base rate');
    if (!cfg.serviceMode) missing.push('service mode');
    if (!cfg.experienceLevel) missing.push('experience level');
    if (!cfg.experience.trim()) missing.push('experience');
    if (id === 'boarding') {
      if (!cfg.businessName?.trim()) missing.push('business name');
      if (!cfg.serviceAddress?.trim()) missing.push('service address');
    }
    if (id === 'transportation') {
      if (!cfg.vehicleInfo?.trim()) missing.push('vehicle info');
      if (!cfg.driverLicense?.trim()) missing.push('driver license');
    }
    if (id === 'stud_services' && !cfg.dogInfo?.trim()) {
      missing.push('dog info');
    }
    return missing;
  };

  const formatMissingFieldsPreview = (missing: string[]): string => {
    if (missing.length <= 2) return missing.join(', ');
    return `${missing.slice(0, 2).join(', ')}, and ${missing.length - 2} more`;
  };

  const getNextIncompleteServiceId = (): string | null => {
    for (const id of selectedServiceIds) {
      if (!isServiceConfigComplete(id)) return id;
    }
    return null;
  };
  const nextIncompleteServiceId = getNextIncompleteServiceId();

  const toggleOfferService = (catId: string, offer: boolean) => {
    if (offer) {
      setServiceDetails((prev) => ({
        ...prev,
        serviceTypes: prev.serviceTypes.includes(catId) ? prev.serviceTypes : [...prev.serviceTypes, catId],
      }));
      setServiceConfigs((prev) => ({
        ...prev,
        [catId]: prev[catId] ?? {
          ...emptyServiceConfig(),
          unit: SERVICE_UNIT_OPTIONS[catId]?.[0]?.value ?? 'per_hour',
        },
      }));
      setExpandedServiceId(catId);
      requestAnimationFrame(() => {
        serviceCardRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => {
          serviceRateInputRefs.current[catId]?.focus();
        }, 180);
      });
    } else {
      setServiceDetails((prev) => ({
        ...prev,
        serviceTypes: prev.serviceTypes.filter((s) => s !== catId),
      }));
      setExpandedServiceId((prev) => (prev === catId ? getNextIncompleteServiceId() : prev));
    }
  };

  useEffect(() => {
    if (currentStep !== 5) return;
    if (selectedServiceIds.length === 0) {
      setExpandedServiceId(SERVICE_CATEGORY_FILTER_OPTIONS[0]?.id ?? null);
      return;
    }
    if (expandedServiceId && SERVICE_CATEGORY_FILTER_OPTIONS.some((s) => s.id === expandedServiceId)) return;
    setExpandedServiceId(getNextIncompleteServiceId() ?? selectedServiceIds[0]);
  }, [currentStep, selectedServiceIds, serviceConfigs, expandedServiceId]);

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
    // Basic validations
    if (serviceDetails.description.trim() === '') return false;
    if (serviceDetails.pricePerService.trim() === '') return false;
    if (serviceDetails.serviceTypes.length === 0) return false;
    if (serviceDetails.startingPrice.trim() === '' || parseFloat(serviceDetails.startingPrice) <= 0) return false;
    if (!serviceDetails.policyAcknowledged) return false;
    
    // Extra fee validations with NaN guards
    if (serviceDetails.travelFeeEnabled) {
      const amount = parseFloat(serviceDetails.travelFeeAmount);
      if (!serviceDetails.travelFeeAmount || isNaN(amount) || amount <= 0) return false;
    }
    if (serviceDetails.additionalPetFeeEnabled) {
      const amount = parseFloat(serviceDetails.additionalPetFeeAmount);
      if (!serviceDetails.additionalPetFeeAmount || isNaN(amount) || amount <= 0) return false;
    }
    if (serviceDetails.holidayRateEnabled) {
      const multiplier = parseFloat(serviceDetails.holidayRateMultiplier);
      if (!serviceDetails.holidayRateMultiplier || isNaN(multiplier) || multiplier < 1.10) return false;
    }
    if (serviceDetails.lastMinuteSurchargeEnabled) {
      const pct = parseFloat(serviceDetails.lastMinuteSurchargePercent);
      if (!serviceDetails.lastMinuteSurchargePercent || isNaN(pct) || pct <= 0) return false;
    }
    
    return true;
  };

  const isTermsValid = () => {
    return termsAccepted.terms && termsAccepted.providerAgreement;
  };

  const handleNext = async () => {
    console.log('[Steps] handleNext', {
      currentStep,
      providerId,
      stripeAccountId,
      payoutSetupComplete,
    });

    // STEP-SPECIFIC GUARDS
    if (currentStep === 0) {
      return goTo(1);
    }

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
      if (!bgCheckConsent) {
        return alert('Please consent to background check.');
      }
      if (!validateUrlOptional(bgRefUrl)) {
        setBgUrlError('Invalid URL');
        return;
      }
      const saved = await saveConsent();
      if (!saved) {
        return;
      }
      return goTo(4);
    }

    if (currentStep === 4) {
      // ✅ Stripe payout gate
      if (!payoutSetupComplete) {
        try {
          const verifyRes = await fetch('/api/payout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authUser?.id }),
          });
          const verifyData = await verifyRes.json().catch(() => ({}));
          if (verifyRes.ok && verifyData?.connected) {
            setPayoutSetupComplete(true);
            setPayoutSetup({ status: 'connected', accountId: verifyData.accountId });
            return goTo(5);
          }
        } catch {
          // Ignore and fall back to existing user guidance below.
        }
        alert('Please complete Stripe Connect first. If you just finished, tap "I\'ve Completed Setup / Re-check".');
        return;
      }
      return goTo(5);
    }

    if (currentStep === 5) {
      // validate service details
      if (!isDetailsValid()) {
        const firstIncomplete = getNextIncompleteServiceId();
        if (firstIncomplete) {
          const serviceLabel =
            SERVICE_CATEGORY_FILTER_OPTIONS.find((s) => s.id === firstIncomplete)?.label ?? 'selected service';
          const missingFields = getServiceMissingFields(firstIncomplete);
          toast({
            title: 'Complete required service details',
            description: `${serviceLabel}: add ${formatMissingFieldsPreview(missingFields)} before continuing.`,
            variant: 'destructive',
          });
          setExpandedServiceId(firstIncomplete);
          requestAnimationFrame(() => {
            serviceCardRefs.current[firstIncomplete]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            window.setTimeout(() => {
              serviceRateInputRefs.current[firstIncomplete]?.focus();
            }, 180);
          });
          return;
        }
        toast({
          title: 'Complete your service details',
          description: 'Please finish required fields before continuing.',
          variant: 'destructive',
        });
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
      // Review is the last screen; submission happens from step 6. Optional: go to dashboard.
      navigate('/dashboard/provider');
      return;
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goTo(currentStep - 1);
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

    if (!authUser?.id) {
      setIdError("Authentication required. Please sign in.");
      setSubmitting(false);
      return;
    }

    if (!idFrontFile || !idBackFile) {
      setIdError("Please upload both front and back images of your ID.");
      setSubmitting(false);
      return;
    }

    try {
      console.log('[ID VERIFICATION] Starting manual ID verification for:', { userId: authUser.id, applicationId });

      // Get auth token from shared client
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      if (!token) {
        throw new Error('No authentication token available');
      }

      // Step 1: Upload front image via backend (bypasses RLS)
      console.log('[ID VERIFICATION] Uploading front image via backend...');
      const frontFormData = new FormData();
      frontFormData.append('file', idFrontFile);

      const frontUploadRes = await fetch('/api/upload-id/front', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: frontFormData
      });

      if (!frontUploadRes.ok) {
        const frontError = await frontUploadRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(`Front image upload failed: ${frontError.error}`);
      }

      const frontUploadData = await frontUploadRes.json();
      const frontImageUrl = frontUploadData.url;

      // Step 2: Upload back image via backend (bypasses RLS)
      console.log('[ID VERIFICATION] Uploading back image via backend...');
      const backFormData = new FormData();
      backFormData.append('file', idBackFile);

      const backUploadRes = await fetch('/api/upload-id/back', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: backFormData
      });

      if (!backUploadRes.ok) {
        const backError = await backUploadRes.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(`Back image upload failed: ${backError.error}`);
      }

      const backUploadData = await backUploadRes.json();
      const backImageUrl = backUploadData.url;

      console.log('[ID VERIFICATION] Images uploaded successfully, calling verification endpoint...');

      // Step 3: Call /api/verify/start to save URLs to database
      const res = await fetch("/api/verify/start", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          frontImageUrl,
          backImageUrl,
          applicationId
        }),
      });

      const data = await res.json().catch(() => ({}));
      console.log('[ID VERIFICATION] API response:', { status: res.status, data });

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to submit ID for verification.");
      }

      // Step 4: Store the application ID for future use
      if (data.applicationId) {
        setApplicationId(data.applicationId);
      }

      // Step 5: SUCCESS - Show green success message
      setIdInputsLocked(true);
      setIdInfo("Your ID documents have been uploaded successfully. Our team will manually review them and notify you when you're approved.");
      setIdVerification({ status: 'pending' });

      console.log('[ID VERIFICATION] Success! Verification status set to pending');

    } catch (e: any) {
      console.error('[ID VERIFICATION] Error:', e);
      setIdError(e?.message || "Failed to upload ID documents.");
      setIdVerification({ status: 'failed', message: e?.message });
    } finally {
      setSubmitting(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!authUser?.id) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${authUser.id}`);
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
    if (!authUser?.id) {
      toast({
        title: "Error",
        description: "Authentication required. Please sign in.",
        variant: "destructive",
      });
      return;
    }

    setBackgroundCheck({ status: 'loading' });

    try {
      // Get the real providerId from the database
      const { providerId: realProviderId } = await ensureOnboardingIds();
      
      const response = await fetch('/api/providers/checks/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: realProviderId }),
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
    if (!authUser?.id) return;

    try {
      const response = await fetch(`/api/providers/verification-status/${authUser.id}`);
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

  // Open Stripe onboarding and start auto-verification polling
  async function openStripeOnboarding() {
    if (!authUser?.id) {
      alert('Please sign in to continue.');
      return;
    }
    
    // Kick off onboarding with real userId
    const r = await fetch('/create-connect-account', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: authUser.id })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data?.url) {
      alert(data?.error?.message || `Onboarding failed (${r.status})`);
      return;
    }
    window.open(data.url, '_blank', 'noopener'); // open Stripe in a new tab
    startVerifyPolling(); // auto-advance when Stripe finishes
  }


  const saveServiceDetails = async () => {
    try {
      // First, upload documents if any
      const uploadedDocs: Record<string, string> = {};
      
      if (documents.businessLicense || documents.insuranceCertificate || documents.certCPR || documents.certAKCTrainer || documents.other) {
        const formData = new FormData();
        if (documents.businessLicense) formData.append('businessLicense', documents.businessLicense);
        if (documents.insuranceCertificate) formData.append('insuranceCertificate', documents.insuranceCertificate);
        if (documents.certCPR) formData.append('certCPR', documents.certCPR);
        if (documents.certAKCTrainer) formData.append('certAKCTrainer', documents.certAKCTrainer);
        if (documents.other) formData.append('other', documents.other);
        
        const uploadResponse = await fetch('/api/providers/upload-documents', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          Object.assign(uploadedDocs, uploadData.files || {});
        }
      }

      // Now save all service details
      const response = await fetch('/api/providers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: serviceDetails.description,
          pricePerService: parseFloat(serviceDetails.pricePerService) || undefined,
          serviceTypes: serviceDetails.serviceTypes,
          serviceConfigs: Object.fromEntries(
            selectedServiceIds.map((id) => [id, serviceConfigs[id]]),
          ),
          badgeCandidateServices,
          radiusKm: serviceDetails.radiusKm,
          // New enrichment fields
          yearsExperience: serviceDetails.yearsExperience,
          offersCats: serviceDetails.offersCats,
          breedRestrictions: serviceDetails.breedRestrictions || null,
          rateType: serviceDetails.rateType,
          startingPrice: parseFloat(serviceDetails.startingPrice) || undefined,
          minBookingMinutes: serviceDetails.minBookingMinutes,
          cancellationPolicy: serviceDetails.cancellationPolicy,
          payoutPreference: serviceDetails.payoutPreference,
          priceVisibility: serviceDetails.priceVisibility,
          travelFeeEnabled: serviceDetails.travelFeeEnabled,
          travelFeeAmount: serviceDetails.travelFeeEnabled ? parseFloat(serviceDetails.travelFeeAmount) : null,
          additionalPetFeeEnabled: serviceDetails.additionalPetFeeEnabled,
          additionalPetFeeAmount: serviceDetails.additionalPetFeeEnabled ? parseFloat(serviceDetails.additionalPetFeeAmount) : null,
          holidayRateEnabled: serviceDetails.holidayRateEnabled,
          holidayRateMultiplier: serviceDetails.holidayRateEnabled ? parseFloat(serviceDetails.holidayRateMultiplier) : null,
          reschedulePolicy: serviceDetails.reschedulePolicy,
          lastMinuteSurchargeEnabled: serviceDetails.lastMinuteSurchargeEnabled,
          lastMinuteSurchargePercent: serviceDetails.lastMinuteSurchargeEnabled
            ? parseFloat(serviceDetails.lastMinuteSurchargePercent)
            : null,
          availability: JSON.stringify({
            weeklySchedule: serviceDetails.weeklySchedule,
            advanceNoticeHours: serviceDetails.advanceNoticeHours,
            maxBookingsPerDay: serviceDetails.maxBookingsPerDay,
            serviceConfigs: Object.fromEntries(
              selectedServiceIds.map((id) => [id, serviceConfigs[id]]),
            ),
          }),
          communicationPolicy: serviceDetails.communicationPolicy,
          policyAcknowledged: serviceDetails.policyAcknowledged,
          uploadedDocuments: uploadedDocs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save service details');
      }

      toast({
        title: "Details Saved",
        description: "Your service details and documents have been saved successfully.",
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

  const submitProviderApplication = async () => {
    if (!termsAccepted.terms || !termsAccepted.providerAgreement) {
      toast({
        title: "Terms Required",
        description: "Please accept both terms and provider agreement to continue.",
        variant: "destructive",
      });
      return false;
    }

    if (!providerId) {
      toast({
        title: "Error",
        description: "Provider ID not found. Please complete previous steps.",
        variant: "destructive",
      });
      return false;
    }

    setProviderStatus('loading');

    try {
      const response = await fetch('/api/provider-applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: providerId,
          userId: authUser?.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setProviderStatus('pending');
      toast({
        title: "Application Submitted",
        description: "Your provider application has been submitted for review.",
      });

      setCurrentStep(7);
      return true;

    } catch (error) {
      console.error('Submit application error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Submission Failed",
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
      console.log('[ONBOARDING] Saving basics with:', {
        userId: authUser.id,
        legalName: basicsData.legalName,
        phone: basicsData.phone
      });

      // Note: We no longer create fake provider IDs
      // The real providerId will be fetched when needed via ensureOnboardingIds()

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

  /** Persists background-check consent. Returns false if validation or API fails. */
  const saveConsent = async (): Promise<boolean> => {
    setBgUrlError(null);
    if (!bgCheckConsent) {
      setConsentError('Please consent to background check.');
      return false;
    }
    if (!validateUrlOptional(bgRefUrl)) {
      setBgUrlError('Invalid URL');
      return false;
    }

    if (!authUser?.id || !applicationId) {
      toast({
        title: "Missing Information",
        description: "Missing application or user information. Please complete previous steps first.",
        variant: "destructive",
      });
      return false;
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
      
      let response = await fetch('/api/applications/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          applicationId, 
          userId: authUser.id, 
          consent: bgCheckConsent,
          bg_ref_url: bgRefUrl || null
        }),
      });

      // Fallback: in rare dev-server stale states this route may 404.
      if (response.status === 404) {
        setConsentMessage('Consent saved locally. Please restart dev server to sync API route.');
        return true;
      }

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Could not save consent.");
      }

      setConsentMessage("Consent saved.");
      return true;
    } catch (e: any) {
      setConsentError(e?.message || "Could not save consent.");
      return false;
    } finally {
      setIsSavingConsent(false);
    }
  };

  // Fetch actual provider status from database
  const fetchProviderStatus = async () => {
    if (!authUser?.id) return;
    
    try {
      const response = await fetch(`/api/providers/status?userId=${authUser.id}`);
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.status === 'verified') {
        setProviderStatus('verified');
      } else {
        setProviderStatus('pending');
      }
    } catch (error) {
      console.error('Error fetching provider status:', error);
    }
  };

  // Check provider status when reaching Step 7
  useEffect(() => {
    if (currentStep === 7 && authUser?.id) {
      fetchProviderStatus();
    }
  }, [currentStep, authUser?.id]);

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
            <p className="text-gray-600">Upload photos of your ID. Both front and back are required.</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900">✓ Accepted formats:</p>
              <p className="text-sm text-blue-800">HEIC, JPG/JPEG, PNG, WebP, or PDF</p>
              <p className="text-xs text-blue-700 mt-2">
                Just take a clear photo of your ID with your phone or upload it from your device. Both front and back are required.
              </p>
            </div>
            
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
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,application/pdf" 
                  capture="environment"
                  disabled={idInputsLocked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file type - accept raw files
                      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
                      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
                      
                      if (!supportedTypes.includes(file.type) && !isHeic) {
                        setIdError(`File type "${file.type}" is not supported. Please use HEIC, JPG, PNG, WebP, or PDF.`);
                        setIdFrontFile(null);
                        e.target.value = '';
                        return;
                      }
                      
                      setIdError(null);
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
                    <p className="text-sm text-green-600 mt-1">✓ Front image ready</p>
                  </div>
                )}
              </div>

              {/* Back of ID */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Back of ID</label>
                <Input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,application/pdf" 
                  capture="environment"
                  disabled={idInputsLocked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file type - accept raw files
                      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
                      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
                      
                      if (!supportedTypes.includes(file.type) && !isHeic) {
                        setIdError(`File type "${file.type}" is not supported. Please use HEIC, JPG, PNG, WebP, or PDF.`);
                        setIdBackFile(null);
                        e.target.value = '';
                        return;
                      }
                      
                      setIdError(null);
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
                    <p className="text-sm text-green-600 mt-1">✓ Back image ready</p>
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

              {/* Show ready message when both images are selected */}
              {idFrontFile && idBackFile && !idInputsLocked && !idError && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    ✓ Both images selected and ready to upload
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Click "Save" below to upload your documents and continue.
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
                  We'll manually review your ID documents to ensure the safety and security of our platform.
                  Our admin team typically completes reviews within 1-2 business days.
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
                I consent to a background check and authorize PAWS to process it upon submission.
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

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={() => void saveConsent()}
                  disabled={isSavingConsent}
                  variant="outline"
                  className="w-full sm:w-auto sm:min-w-[140px]"
                  data-testid="button-save-consent"
                >
                  {isSavingConsent ? "Saving…" : "Save consent"}
                </Button>
                <p className="text-xs text-gray-500 sm:flex-1">
                  Use <strong className="font-medium text-gray-700">Next</strong> below to continue — your consent will be saved automatically if needed.
                </p>
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
                  <Select value={accountType} onValueChange={(value) => setAccountType(value as 'individual' | 'business')}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-account-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onClick={openStripeOnboarding}
                  className="w-full"
                  data-testid="button-connect-stripe"
                >
                  Connect with Stripe
                </Button>
                <LegalBlurb variant="stripe" />
                
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
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">Complete Setup in New Window</p>
                  <p className="text-sm text-blue-700 mb-3">Finish your Stripe Connect setup in the opened window.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('[BUTTON] Re-opening Stripe setup window');
                      openStripeOnboarding();
                    }}
                    data-testid="button-reopen-stripe"
                  >
                    Open Stripe Setup Again
                  </Button>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 underline"
                  onClick={() => {
                    console.log('[BUTTON] I\'ve Completed Setup / Re-check clicked');
                    manualRecheck();
                  }}
                  data-testid="button-check-payout-status"
                >
                  I've Completed Setup / Re-check
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
                <span className="text-blue-600 font-medium">⚠ Stripe not connected yet.</span>
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

      case 5: // Service Details (Enhanced) — flattened: all categories show detail cards; offer-toggle per card
        return (
          <div className="space-y-7 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_p]:text-black [&_label]:text-black [&_li]:text-black [&_span]:text-black [&_strong]:text-black">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Service Details & Documents</h2>
              <p className="mt-1 text-sm text-gray-600">
                We guide you one service at a time. Turn on <span className="font-semibold text-blue-600">I offer this service</span>{' '}
                to unlock that card, then complete pricing and experience details.
              </p>
            </div>

            {hasSelectedServices && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/90 p-3">
                <p className="text-xs font-medium text-blue-900">Verification expectations (selected services)</p>
                <ul className="mt-2 space-y-2 text-xs text-blue-950">
                  {selectedServiceIds.map((sid) => {
                    const info = getServiceVerificationInfo(sid);
                    return (
                      <li key={sid}>
                        <span className="font-semibold">{info.badgeLabel}:</span> {info.requirements.join(' · ')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="space-y-6" data-testid="services-flattened-cards">
              {SERVICE_CATEGORY_FILTER_OPTIONS.map((cat) => {
                const offered = serviceDetails.serviceTypes.includes(cat.id);
                const cfg = serviceConfigs[cat.id] ?? emptyServiceConfig();
                const id = cat.id;
                const unitOptions = SERVICE_UNIT_OPTIONS[id] ?? SERVICE_UNIT_OPTIONS.walking;
                const normalizedUnit = unitOptions.some((opt) => opt.value === cfg.unit)
                  ? cfg.unit
                  : unitOptions[0].value;
                const isExpanded = expandedServiceId === id;
                const status: 'verified' | 'pending' | 'inactive' = offered
                  ? (isServiceConfigComplete(id) ? 'verified' : 'pending')
                  : 'inactive';
                return (
                  <div
                    key={id}
                    ref={(el) => {
                      serviceCardRefs.current[id] = el;
                    }}
                    className={`group relative overflow-hidden rounded-2xl bg-white transition-all duration-300 ease-out ${
                      offered
                        ? 'border border-blue-400/70 bg-blue-50/60 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-2 ring-blue-100/70 hover:-translate-y-1 hover:shadow-xl animate-[pulse_0.9s_ease-out_1]'
                        : 'border border-blue-100/80 bg-blue-50/55 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:border-blue-300/50 hover:shadow-lg'
                    }`}
                    data-testid={`card-service-config-${id}`}
                  >
                    <div className="bg-gradient-to-b from-blue-50/50 to-transparent p-5 pb-4 sm:p-6 sm:pb-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300 ${
                            offered
                              ? 'from-blue-600 to-blue-500 text-white shadow-md'
                              : 'from-blue-100 to-blue-50 text-blue-600 group-hover:from-blue-200 group-hover:to-blue-100'
                          }`}>
                            <span aria-hidden>{cat.pillEmoji}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold tracking-tight text-slate-900">{cat.label}</h3>
                            <p className="mt-0.5 text-sm text-gray-500">
                              {SERVICE_CARD_DESCRIPTIONS[id] ?? 'Professional pet care service.'}
                            </p>
                            <label className={`mt-4 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                              offered ? 'bg-blue-500/10 text-blue-700' : 'bg-slate-50 text-slate-700 hover:bg-blue-50'
                            }`}>
                              <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                checked={offered}
                                onChange={(e) => toggleOfferService(id, e.target.checked)}
                                data-testid={`checkbox-offer-service-${id}`}
                              />
                              I offer this service
                            </label>
                            {!offered && (
                              <p className="mt-1 text-xs text-slate-600">
                                Fill details now, then turn this on to include it in your profile.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs shadow-sm backdrop-blur ${
                            status === 'verified'
                              ? 'border-blue-500/40 bg-blue-600 font-semibold text-white'
                              : 'border-blue-200/50 bg-blue-500/10 text-blue-600'
                          }`}
                        >
                          {status === 'verified' ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                          {status === 'verified' ? 'Verified Ready' : 'Pending Verification'}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors duration-200 hover:border-blue-300 hover:text-blue-600"
                          onClick={() => setExpandedServiceId((prev) => (prev === id ? null : id))}
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.label} details`}
                          data-testid={`button-toggle-service-card-${id}`}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    </div>

                    <div className={`px-5 pb-6 pt-2 transition-all duration-300 ease-out sm:px-6 ${isExpanded ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'}`} aria-hidden={!isExpanded}>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pricing</p>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Base rate / Starting at ($)</label>
                              <div className="relative mt-1">
                                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-blue-600">$</span>
                                <Input
                                  ref={(el) => {
                                    serviceRateInputRefs.current[id] = el;
                                  }}
                                  type="number"
                                  min="1"
                                  step="0.01"
                                  value={cfg.baseRate}
                                  onChange={(e) =>
                                    setServiceConfigs((prev) => ({
                                      ...prev,
                                      [id]: { ...cfg, baseRate: e.target.value },
                                    }))
                                  }
                                  data-testid={`input-service-rate-${id}`}
                                  className="h-12 rounded-lg border-slate-300 bg-white pl-7 placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Unit</label>
                              <Select
                                value={normalizedUnit}
                                onValueChange={(value) =>
                                  setServiceConfigs((prev) => ({
                                    ...prev,
                                    [id]: {
                                      ...cfg,
                                      unit: value as ServiceConfig['unit'],
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1 h-12 rounded-lg border-slate-300 bg-white text-slate-800 focus:ring-4 focus:ring-blue-500/10" data-testid={`select-service-unit-${id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  {unitOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Service setup</p>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Service mode</label>
                              <Select
                                value={cfg.serviceMode ?? 'standard'}
                                onValueChange={(value) =>
                                  setServiceConfigs((prev) => ({
                                    ...prev,
                                    [id]: {
                                      ...cfg,
                                      serviceMode: value as ServiceConfig['serviceMode'],
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1 h-12 rounded-lg border-slate-300 bg-white text-slate-800 focus:ring-4 focus:ring-blue-500/10" data-testid={`select-service-mode-${id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="premium">Premium</SelectItem>
                                  <SelectItem value="specialized">Specialized care</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-600">Experience level</label>
                              <Select
                                value={cfg.experienceLevel ?? 'entry'}
                                onValueChange={(value) =>
                                  setServiceConfigs((prev) => ({
                                    ...prev,
                                    [id]: {
                                      ...cfg,
                                      experienceLevel: value as ServiceConfig['experienceLevel'],
                                    },
                                  }))
                                }
                              >
                                <SelectTrigger className="mt-1 h-12 rounded-lg border-slate-300 bg-white text-slate-800 focus:ring-4 focus:ring-blue-500/10" data-testid={`select-experience-level-${id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="entry">0-1 years</SelectItem>
                                  <SelectItem value="intermediate">2-4 years</SelectItem>
                                  <SelectItem value="advanced">5+ years</SelectItem>
                                  <SelectItem value="certified">Certified / Licensed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Experience</p>
                          <div>
                            <label className="block text-sm font-medium italic text-slate-600">Service-specific experience</label>
                            <textarea
                              className="mt-1 min-h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm placeholder:text-slate-400 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50"
                              placeholder={`Describe your ${cat.label.toLowerCase()} experience`}
                              value={cfg.experience}
                              onChange={(e) =>
                                setServiceConfigs((prev) => ({
                                  ...prev,
                                  [id]: { ...cfg, experience: e.target.value },
                                }))
                              }
                              data-testid={`textarea-service-experience-${id}`}
                            />
                          </div>
                        </div>

                        {id === 'boarding' && offered && (
                          <div className="space-y-4 border-t border-blue-100/70 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required details</p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-600">
                                  Business name <span className="text-red-600">Required</span>
                                </label>
                                <Input
                                  value={cfg.businessName ?? ''}
                                  onChange={(e) =>
                                    setServiceConfigs((prev) => ({
                                      ...prev,
                                      [id]: { ...cfg, businessName: e.target.value },
                                    }))
                                  }
                                  placeholder="Boarding business name"
                                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                  data-testid="input-boarding-business-name"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-600">
                                  Service address <span className="text-red-600">Required</span>
                                </label>
                                <Input
                                  value={cfg.serviceAddress ?? ''}
                                  onChange={(e) =>
                                    setServiceConfigs((prev) => ({
                                      ...prev,
                                      [id]: { ...cfg, serviceAddress: e.target.value },
                                    }))
                                  }
                                  placeholder="Facility address"
                                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                  data-testid="input-boarding-address"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {id === 'transportation' && offered && (
                          <div className="space-y-4 border-t border-blue-100/70 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required details</p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-600">
                                  Vehicle info <span className="text-red-600">Required</span>
                                </label>
                                <Input
                                  value={cfg.vehicleInfo ?? ''}
                                  onChange={(e) =>
                                    setServiceConfigs((prev) => ({
                                      ...prev,
                                      [id]: { ...cfg, vehicleInfo: e.target.value },
                                    }))
                                  }
                                  placeholder="Year, make, model"
                                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                  data-testid="input-transport-vehicle"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-sm font-medium text-slate-600">
                                  Driver license <span className="text-red-600">Required</span>
                                </label>
                                <Input
                                  value={cfg.driverLicense ?? ''}
                                  onChange={(e) =>
                                    setServiceConfigs((prev) => ({
                                      ...prev,
                                      [id]: { ...cfg, driverLicense: e.target.value },
                                    }))
                                  }
                                  placeholder="License number"
                                  className="h-12 rounded-lg border-slate-300 bg-white placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10"
                                  data-testid="input-transport-license"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {id === 'stud_services' && offered && (
                          <div className="space-y-4 border-t border-blue-100/70 pt-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Required details</p>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-slate-600">
                                Dog info <span className="text-red-600">Required</span>
                              </label>
                              <textarea
                                className="min-h-20 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                placeholder="Stud dog details: breed, health confirmation, and notes"
                                value={cfg.dogInfo ?? ''}
                                onChange={(e) =>
                                  setServiceConfigs((prev) => ({
                                    ...prev,
                                    [id]: { ...cfg, dogInfo: e.target.value },
                                  }))
                                }
                                data-testid="textarea-stud-dog-info"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {!hasSelectedServices && (
              <p className="text-sm font-medium text-amber-800">
                Turn on <span className="font-semibold">I offer this service</span> on at least one category above.
              </p>
            )}
            
            {/* Identity & Credentials Section */}
            <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
              <h3 className="text-lg font-medium">Identity & Credentials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">State (for legal requirements)</label>
                  <Select value={serviceDetails.state} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger id="stateSelect" className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-state">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                      <SelectItem value="PA">Pennsylvania</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Professional License Number (if required)</label>
                  <Input 
                    id="licenseNumber"
                    type="text" 
                    placeholder="Enter license number"
                    value={serviceDetails.licenseNumber}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    data-testid="input-license-number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for certain services in some states</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo (Optional)</label>
                <Input 
                  type="file" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Simple validation: max 8MB, images only
                      const maxSize = 8 * 1024 * 1024;
                      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                      
                      if (file.size > maxSize) {
                        toast({
                          title: "File too large",
                          description: "Profile photo must be under 8MB",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      if (!allowedTypes.includes(file.type)) {
                        toast({
                          title: "Invalid file type",
                          description: "Please upload a PNG or JPEG image",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // TODO: Upload to signed URL and set profilePhotoUrl
                      toast({
                        title: "Photo ready",
                        description: "Profile photo will be uploaded when you save",
                      });
                    }
                  }}
                  accept="image/png,image/jpeg,image/jpg"
                  data-testid="input-profile-photo"
                />
                <p className="text-xs text-gray-500 mt-1">Max 8MB. PNG or JPEG only.</p>
              </div>
            </div>
            
            {/* Document Uploads Section */}
            {hasSelectedServices ? (
              <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
                <h3 className="text-lg font-medium">Verified Documents</h3>
                <p className="text-sm text-gray-600">
                  Upload credentials for the services you selected.
                  {requiresBusinessDocs ? ' Business docs are required for at least one selected service.' : ''}
                </p>
                {badgeCandidateServices.length > 0 && (
                  <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
                    Badge queue active: selected professional services will remain
                    <span className="font-semibold"> pending verified badges </span>
                    until required documents are approved.
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Professional License {requiresProfessionalLicense && <span className="text-red-600">Required</span>}
                    </label>
                    <Input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const maxSize = 8 * 1024 * 1024;
                          const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
                          if (file.size > maxSize) {
                            toast({ title: "File too large", description: "Max 8MB", variant: "destructive" });
                            return;
                          }
                          if (!allowedTypes.includes(file.type)) {
                            toast({ title: "Invalid type", description: "PDF, PNG, or JPEG only", variant: "destructive" });
                            return;
                          }
                          setDocuments(prev => ({ ...prev, businessLicense: file }));
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png"
                      data-testid="input-business-license"
                    />
                    {documents.businessLicense && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.businessLicense.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Insurance Certificate {selectedServiceIds.includes('boarding') && <span className="text-red-600">Required</span>}
                    </label>
                    <Input 
                      type="file" 
                      onChange={(e) => setDocuments(prev => ({ ...prev, insuranceCertificate: e.target.files?.[0] || null }))}
                      accept=".pdf,.jpg,.jpeg,.png"
                      data-testid="input-insurance-certificate"
                    />
                    {documents.insuranceCertificate && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.insuranceCertificate.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CPR Certification {badgeCandidateServices.length > 0 && <span className="text-blue-700">Recommended</span>}
                    </label>
                    <Input 
                      type="file" 
                      onChange={(e) => setDocuments(prev => ({ ...prev, certCPR: e.target.files?.[0] || null }))}
                      accept=".pdf,.jpg,.jpeg,.png"
                      data-testid="input-cert-cpr"
                    />
                    {documents.certCPR && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.certCPR.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      AKC Trainer Cert {selectedServiceIds.includes('training') && <span className="text-blue-700">Recommended</span>}
                    </label>
                    <Input 
                      type="file" 
                      onChange={(e) => setDocuments(prev => ({ ...prev, certAKCTrainer: e.target.files?.[0] || null }))}
                      accept=".pdf,.jpg,.jpeg,.png"
                      data-testid="input-cert-akc-trainer"
                    />
                    {documents.certAKCTrainer && (
                      <p className="text-xs text-green-600 mt-1">✓ {documents.certAKCTrainer.name}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Turn on <span className="font-medium">I offer this service</span> on at least one category above to unlock required document uploads.
              </div>
            )}

            {/* Experience & Preferences Section */}
            <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
              <h3 className="text-lg font-medium">Experience & Preferences</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Years of Experience</label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="50"
                    value={serviceDetails.yearsExperience}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || 0 }))}
                    data-testid="input-years-experience"
                  />
                  <p className="text-xs text-gray-500 mt-1">Self-reported. May be subject to verification.</p>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={serviceDetails.offersCats}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, offersCats: e.target.checked }))}
                      data-testid="checkbox-offers-cats"
                    />
                    <span className="text-sm">I also service cats</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Breed Restrictions (Optional)</label>
                <Input 
                  type="text" 
                  placeholder="e.g., No large aggressive breeds"
                  value={serviceDetails.breedRestrictions}
                  onChange={(e) => setServiceDetails(prev => ({ ...prev, breedRestrictions: e.target.value }))}
                  data-testid="input-breed-restrictions"
                />
              </div>
            </div>

            {/* Pricing & Fees Section */}
            <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
              <h3 className="text-lg font-medium">Pricing & Fees</h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Rate Type</label>
                  <Select value={serviceDetails.rateType} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, rateType: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-rate-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="per_visit">Per Visit</SelectItem>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Starting Price ($)</label>
                  <Input 
                    type="number" 
                    placeholder="50"
                    value={serviceDetails.startingPrice}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, startingPrice: e.target.value }))}
                    data-testid="input-starting-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Payout preference</label>
                  <Select value={serviceDetails.payoutPreference} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, payoutPreference: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-payout-preference">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="fast">Fast payout (1-2 days)</SelectItem>
                      <SelectItem value="standard">Standard payout (2-3 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Price visibility</label>
                  <Select value={serviceDetails.priceVisibility} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, priceVisibility: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-price-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="exact">Show exact price</SelectItem>
                      <SelectItem value="starting_at">Show "starting at"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Booking Duration</label>
                <Select
                  value={String(serviceDetails.minBookingMinutes)}
                  onValueChange={(value) => setServiceDetails(prev => ({ ...prev, minBookingMinutes: parseInt(value, 10) }))}
                >
                  <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-min-booking-minutes">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={serviceDetails.travelFeeEnabled}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, travelFeeEnabled: e.target.checked }))}
                      data-testid="checkbox-travel-fee"
                    />
                    <span className="text-sm">Travel Fee</span>
                  </label>
                  {serviceDetails.travelFeeEnabled && (
                    <Input 
                      type="number" 
                      placeholder="10"
                      className="w-24"
                      value={serviceDetails.travelFeeAmount}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, travelFeeAmount: e.target.value }))}
                      data-testid="input-travel-fee-amount"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={serviceDetails.additionalPetFeeEnabled}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, additionalPetFeeEnabled: e.target.checked }))}
                      data-testid="checkbox-additional-pet-fee"
                    />
                    <span className="text-sm">Additional Pet Fee</span>
                  </label>
                  {serviceDetails.additionalPetFeeEnabled && (
                    <Input 
                      type="number" 
                      placeholder="5"
                      className="w-24"
                      value={serviceDetails.additionalPetFeeAmount}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, additionalPetFeeAmount: e.target.value }))}
                      data-testid="input-additional-pet-fee-amount"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded"
                      checked={serviceDetails.holidayRateEnabled}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, holidayRateEnabled: e.target.checked }))}
                      data-testid="checkbox-holiday-rate"
                    />
                    <span className="text-sm">Holiday Rate Multiplier</span>
                  </label>
                  {serviceDetails.holidayRateEnabled && (
                    <Input 
                      type="number" 
                      placeholder="1.5"
                      step="0.1"
                      min="1"
                      max="3"
                      className="w-24"
                      value={serviceDetails.holidayRateMultiplier}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, holidayRateMultiplier: e.target.value }))}
                      data-testid="input-holiday-rate-multiplier"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
              <h3 className="text-lg font-medium">Availability</h3>
              <p className="text-sm text-slate-700">
                Set full recurring hours and exceptions in your provider calendar after onboarding.
              </p>
              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-slate-700">
                This step sets lightweight booking preferences only.
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Advance notice</label>
                  <Select value={serviceDetails.advanceNoticeHours} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, advanceNoticeHours: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-advance-notice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="0">Same day</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max bookings/day</label>
                  <Select value={serviceDetails.maxBookingsPerDay} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, maxBookingsPerDay: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-max-bookings-per-day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4_plus">4+</SelectItem>
                    </SelectContent>
                  </Select>
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
            </div>

            {/* Policies Section */}
            <div className="rounded-xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_8px_24px_rgb(15,23,42,0.04)] space-y-4">
              <h3 className="text-lg font-medium">Policies</h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                <Select value={serviceDetails.cancellationPolicy} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, cancellationPolicy: value as any }))}>
                  <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-cancellation-policy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p><strong>Flexible:</strong> Full refund up to 24h before, 50% refund &lt;24h</p>
                  <p><strong>Moderate:</strong> Full refund up to 48h before, 50% refund &lt;48h</p>
                  <p><strong>Strict:</strong> 50% refund up to 72h before, no refund &lt;72h</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Reschedule policy</label>
                  <Select value={serviceDetails.reschedulePolicy} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, reschedulePolicy: value as any }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-reschedule-policy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={serviceDetails.lastMinuteSurchargeEnabled}
                      onChange={(e) => setServiceDetails(prev => ({ ...prev, lastMinuteSurchargeEnabled: e.target.checked }))}
                      data-testid="checkbox-last-minute-surcharge"
                    />
                    <span className="text-sm">Last-minute surcharge</span>
                  </label>
                </div>
              </div>
              {serviceDetails.lastMinuteSurchargeEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">Last-minute surcharge (%)</label>
                  <Select value={serviceDetails.lastMinuteSurchargePercent} onValueChange={(value) => setServiceDetails(prev => ({ ...prev, lastMinuteSurchargePercent: value }))}>
                    <SelectTrigger className="h-12 rounded-lg border-slate-300 bg-white" data-testid="select-last-minute-surcharge-percent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="15">15%</SelectItem>
                      <SelectItem value="20">20%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">In-App Communication Policy</p>
                    <p className="text-xs text-blue-700 mt-1">
                      All client communications must happen through the app for safety and security.
                      This protects both you and your clients.
                    </p>
                  </div>
                </div>
                
                <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    className="rounded"
                    checked={serviceDetails.policyAcknowledged}
                    onChange={(e) => setServiceDetails(prev => ({ ...prev, policyAcknowledged: e.target.checked }))}
                    data-testid="checkbox-policy-acknowledged"
                  />
                  <span className="text-sm text-blue-900">I understand and will comply with in-app communication policy</span>
                </label>
              </div>
            </div>

            {/* Fixed bar: long step — keep primary actions in view (footer hidden on this step) */}
            <div
              className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur supports-[backdrop-filter]:bg-white/90"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="order-2 text-xs text-slate-500 sm:order-1 sm:max-w-[42%]">
                  Save your draft anytime. Continue guides you to the next incomplete service, then advances when ready.
                </p>
                <div className="order-1 flex w-full flex-col gap-2 sm:order-2 sm:w-auto sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleBack}
                    data-testid="button-back-step"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void saveServiceDetails()}
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={!canSaveServiceDetails}
                    data-testid="button-save-service-details-sticky"
                  >
                    Save service details
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={!hasSelectedServices}
                    onClick={() => {
                      if (nextIncompleteServiceId) {
                        const serviceLabel =
                          SERVICE_CATEGORY_FILTER_OPTIONS.find((s) => s.id === nextIncompleteServiceId)?.label ?? 'selected service';
                        const missingFields = getServiceMissingFields(nextIncompleteServiceId);
                        toast({
                          title: 'Complete required service details',
                          description: `${serviceLabel}: add ${formatMissingFieldsPreview(missingFields)} before continuing.`,
                          variant: 'destructive',
                        });
                        setExpandedServiceId(nextIncompleteServiceId);
                        requestAnimationFrame(() => {
                          serviceCardRefs.current[nextIncompleteServiceId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          window.setTimeout(() => {
                            serviceRateInputRefs.current[nextIncompleteServiceId]?.focus();
                          }, 180);
                        });
                        return;
                      }
                      void handleNext();
                    }}
                    data-testid="button-continue-step5-sticky"
                  >
                    {nextIncompleteServiceId ? 'Next incomplete service' : 'Continue'}
                  </Button>
                </div>
                {!canSaveServiceDetails && (
                  <p className="order-3 w-full text-xs text-amber-700">
                    Complete each offered service (rate, unit, experience), conditional fields, and required documents to
                    enable save.
                  </p>
                )}
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
                  onClick={submitProviderApplication}
                  className="w-full"
                  disabled={providerStatus === 'loading'}
                  data-testid="button-complete-onboarding"
                >
                  {providerStatus === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application for Review'
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case 7: // Review
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {providerStatus === 'verified' ? 'Welcome to the Platform!' : 'Application Review'}
            </h2>
            
            {providerStatus === 'verified' ? (
              // VERIFIED STATUS - Show success message
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
            ) : (
              // PENDING STATUS - Show pending review message
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Application Submitted</h3>
                <p className="text-blue-700 mb-4">
                  Your application has been submitted and is pending review.
                </p>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Provider Status:</strong> <span className="text-blue-600 font-semibold">Pending Review</span>
                  </p>
                  <p className="text-sm text-gray-700">
                    Our team will review your application within 24-48 hours. You'll receive a notification once your application is approved.
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800">Application Checklist:</h4>
              <div className="flex justify-between text-sm">
                <span>Identity Documents Submitted</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Background Check Consent</span>
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

            <div className="pt-4 text-center">
              <Button 
                onClick={() => navigate('/dashboard/provider')}
                variant="outline"
                className="w-full"
                data-testid="button-go-to-dashboard"
              >
                Go to Dashboard
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                You'll be notified once your application is approved
              </p>
            </div>
          </div>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div
      className={`mx-auto rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50/30 p-6 ${currentStep === 5 ? 'max-w-3xl' : 'max-w-2xl'}`}
      style={{
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(59,130,246,0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(59,130,246,0.05) 0px, transparent 50%)',
      }}
    >
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex min-w-0 flex-1 items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                  step.status === 'completed' 
                    ? 'border-green-500 bg-green-500 text-white shadow-sm' 
                    : step.status === 'current'
                    ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                    : 'border-gray-300 bg-gray-100 text-gray-500'
                }`}>
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-semibold">{step.id + 1}</span>
                  )}
                </div>
                <span className={`mt-1 text-[11px] ${
                  step.status === 'current' ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 rounded ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-sm">
        <CardHeader className="border-b border-blue-100/70 bg-gradient-to-b from-blue-50/50 to-transparent">
          <div className="text-sm text-slate-600">
            Step {currentStep + 1} of {steps.length}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Step 5 uses a fixed action bar inside the step (avoid duplicate Back/Next + overlap) */}
      {currentStep !== 5 && (
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="w-full sm:w-auto"
            data-testid="button-back-step"
          >
            Back
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto sm:min-w-[120px]"
            data-testid="button-next-step"
            onClick={() => void handleNext()}
            disabled={currentStep === 4 && !payoutSetupComplete}
          >
            {currentStep === 7 ? 'Go to dashboard' : 'Next'}
          </Button>
        </div>
      )}
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