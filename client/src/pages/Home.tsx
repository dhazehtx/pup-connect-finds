import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Lock,
  LogIn,
  PawPrint,
  Search,
  Shield,
  ShoppingBag,
  Star,
  UserPlus,
} from 'lucide-react';
import { APP_SHELL_CONTAINER_CLASS } from '@/lib/appShell';
import { PawsWordmarkLockup } from '@/components/brand/PawsWordmark';
import { ChromaticAmbience } from '@/components/greeting/ChromaticAmbience';

const Home = () => {
  const { user, loading, continueAsGuest, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = 'PAWS — Pet Adoption & Web Services';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const shouldRedirect = !loading && !user && !isGuest;
    const currentPath = location.pathname;
    const targetPath = '/greeting';

    if (shouldRedirect && currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [loading, user, isGuest, location.pathname, navigate]);

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate('/explore');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-blue-50/20">
        <div className="text-center">
          <div
            className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-[3px] border-[#2563EB] border-t-transparent sm:mb-4 sm:h-12 sm:w-12"
            aria-hidden
          />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="greeting-page min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50/20 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] font-sans antialiased sm:pb-24">
      <section className="greeting-hero relative overflow-hidden pb-3 pt-7 text-center text-slate-800 sm:pb-4 sm:pt-9">
        <ChromaticAmbience />

        <div className={`relative z-10 ${APP_SHELL_CONTAINER_CLASS} px-4`}>
          <div className="mx-auto w-full max-w-lg rounded-[1.75rem] border border-blue-100/50 bg-white/90 px-4 pb-5 pt-7 shadow-sm shadow-[0_0_50px_-12px_rgba(37,99,235,0.1)] backdrop-blur-sm sm:px-6 sm:pb-6 sm:pt-8">
            <div className="flex flex-col items-center text-center">
              <h1
                className="group greeting-brand-mark font-brand-wordmark inline-flex items-baseline justify-center gap-1 text-[clamp(1.1rem,3.4vw,1.55rem)] font-medium leading-none tracking-widest text-slate-700"
                aria-label="PAWS"
              >
                <PawsWordmarkLockup />
              </h1>

              <div
                className="greeting-brand-mark greeting-brand-mark--subtitle mt-4 h-px w-14 bg-gradient-to-r from-transparent via-slate-300/90 to-transparent sm:w-16"
                aria-hidden
              />

              <p className="greeting-brand-mark greeting-brand-mark--subtitle mt-3 max-w-md text-[14px] font-extralight leading-snug tracking-wide text-slate-500 sm:mt-3.5 sm:text-[15px]">
                Pet Adoption & Web Services.
              </p>

              <p className="mt-4 max-w-lg text-[14px] font-medium leading-[1.65] text-slate-700 sm:mt-5">
                Connect with shelters and verified breeders to discover adorable, healthy puppies — and find your{' '}
                <span className="font-semibold text-blue-600">
                  perfect companion
                </span>
                .
              </p>

              <p className="mt-5 text-[11px] font-normal leading-relaxed text-slate-400 sm:mt-5 sm:text-xs">
                Trusted by shelters & breeders. Loved by families.
              </p>
            </div>

            <div className="mt-6 flex w-full flex-col items-center gap-3 sm:mt-7 sm:gap-4">
              <button
                type="button"
                className="greeting-btn-primary greeting-btn-explore-gradient inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-[16px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                onClick={handleGuestAccess}
              >
                <Search className="h-5 w-5 shrink-0 text-[#111827]" aria-hidden />
                <span>Explore as Guest</span>
              </button>

              <p className="flex items-center justify-center gap-2 text-[11px] font-medium leading-tight text-slate-500 sm:text-[12px]">
                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
                <span>Safe & Secure Adoption.</span>
              </p>

              <div className="grid w-full grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  className="greeting-btn-secondary greeting-btn-secondary--polished inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[15px] font-semibold shadow-sm transition-colors sm:px-5"
                  onClick={() => navigate('/auth')}
                >
                  <UserPlus className="h-5 w-5 shrink-0" aria-hidden />
                  <span>Sign Up</span>
                </button>
                <button
                  type="button"
                  className="greeting-btn-secondary greeting-btn-secondary--polished inline-flex h-12 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[15px] font-semibold shadow-sm transition-colors sm:px-5"
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="h-5 w-5 shrink-0" aria-hidden />
                  <span>Sign In</span>
                </button>
              </div>

              <button
                type="button"
                className="greeting-btn-secondary greeting-btn-secondary--polished inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white/90 px-4 text-[14px] font-semibold text-slate-700 shadow-sm transition-colors hover:bg-white sm:px-5"
                onClick={() => navigate('/marketplace?tab=store')}
              >
                <ShoppingBag className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                <span>PAWS Store &amp; Pup Box</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={`${APP_SHELL_CONTAINER_CLASS} pb-3 pt-0 sm:pb-4`}>
        <section
          className="greeting-trust-bar rounded-t-2xl px-3 py-3 sm:px-6 sm:py-4"
          aria-label="Trust highlights"
        >
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px] font-medium text-slate-600 sm:gap-x-10 sm:text-[14px]">
            <span className="inline-flex items-center gap-2.5">
              <CheckCircle className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
              Verified Breeders
            </span>
            <span className="inline-flex items-center gap-2.5">
              <Shield className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
              Health Guaranteed
            </span>
            <span className="inline-flex items-center gap-2.5">
              <Star className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
              5-Star Platform
            </span>
            <span className="inline-flex items-center gap-2.5">
              <PawPrint className="h-5 w-5 shrink-0 text-blue-600" aria-hidden />
              Trusted by Families
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
