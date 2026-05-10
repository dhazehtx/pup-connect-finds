import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Gift,
  Truck,
  Shield,
  RotateCcw,
  Check,
  ShoppingCart,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useCart } from "@/hooks/use-cart";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type PupboxApiPlan = {
  key: string;
  id: string;
  amount: string;
  recurring: boolean;
  name: string;
  inDatabase: boolean;
};

/** Must match rows in server `PUPBOX_CATALOG_JSON` (keys) e.g. small_subscription, small_one_time */
function catalogKey(
  planId: "small" | "medium" | "large",
  billing: "subscription" | "oneTime",
): string {
  const suffix = billing === "subscription" ? "subscription" : "one_time";
  return `${planId}_${suffix}`;
}

// SOL:PUPBOX:START
const PupBoxSubscription = () => {
  useEffect(() => {
    document.title = "Pup Box — PAWS";
  }, []);

  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart, getItemCount } = useCart();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  const { data: pupboxRes, isLoading: pupboxPlansLoading } = useQuery({
    queryKey: ["/api/pupbox/plans"],
    queryFn: async () => {
      const res = await fetch("/api/pupbox/plans", { credentials: "include" });
      if (!res.ok) throw new Error("Could not load Pup Box catalog");
      return res.json() as Promise<{
        configured: boolean;
        message?: string;
        plans: PupboxApiPlan[];
      }>;
    },
    staleTime: 60_000,
  });

  const catalogByKey = useMemo(() => {
    const m = new Map<string, PupboxApiPlan>();
    for (const p of pupboxRes?.plans ?? []) {
      m.set(p.key, p);
    }
    return m;
  }, [pupboxRes]);

  const pupboxConfigured = pupboxRes?.configured === true;

  // Track billing type selection for each plan
  const [billingType, setBillingType] = useState<{
    small: "subscription" | "oneTime";
    medium: "subscription" | "oneTime";
    large: "subscription" | "oneTime";
  }>({
    small: "subscription",
    medium: "subscription",
    large: "subscription",
  });

  const plans = [
    {
      id: "small" as const,
      name: "Small",
      size: "small",
      subscriptionPrice: 19.99,
      oneTimePrice: 23.99,
      description: "Great for pups under 25 lbs",
      features: [
        "3-4 premium toys",
        "2-3 healthy treats",
        "1 grooming essential",
        "Free shipping included",
      ],
      badge: "Most Popular",
      badgeColor: "blue",
    },
    {
      id: "medium" as const,
      name: "Medium",
      size: "medium",
      subscriptionPrice: 29.99,
      oneTimePrice: 35.99,
      description: "Perfect for dogs 25-65 lbs",
      features: [
        "4-5 premium toys",
        "3-4 healthy treats",
        "1-2 grooming essentials",
        "Free shipping included",
      ],
      badge: null,
      badgeColor: null,
    },
    {
      id: "large" as const,
      name: "Large",
      size: "large",
      subscriptionPrice: 39.99,
      oneTimePrice: 47.99,
      description: "Ideal for dogs over 65 lbs",
      features: [
        "5-6 premium toys",
        "4-5 healthy treats",
        "2 grooming essentials",
        "Free shipping included",
      ],
      badge: "Best Value",
      badgeColor: "blue",
    },
  ];

  const resolvePrice = (
    planId: "small" | "medium" | "large",
    billing: "subscription" | "oneTime",
  ): number => {
    const row = catalogByKey.get(catalogKey(planId, billing));
    if (row) return parseFloat(row.amount);
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return 0;
    return billing === "subscription" ? plan.subscriptionPrice : plan.oneTimePrice;
  };

  const handleAddToCart = (planId: "small" | "medium" | "large") => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const selectedBillingType = billingType[planId];
    const isSubscription = selectedBillingType === "subscription";

    const key = catalogKey(planId, selectedBillingType);
    const catalogRow = catalogByKey.get(key);

    if (!pupboxConfigured || !catalogRow) {
      toast({
        variant: "destructive",
        title: "Pup Box not configured",
        description:
          "Set PUPBOX_CATALOG_JSON on the server, run npm run store:sync-catalog, then restart the API.",
      });
      return;
    }

    if (!catalogRow.inDatabase) {
      toast({
        variant: "destructive",
        title: "Sync Pup Box catalog",
        description: "Run npm run store:sync-catalog after setting PUPBOX_CATALOG_JSON so products exist in the database.",
      });
      return;
    }

    const price = resolvePrice(planId, selectedBillingType);
    const billingLabel = isSubscription ? "Subscription" : "One-Time";
    const displayName = `${plan.name} Pup Box (${billingLabel})`;

    addToCart({
      id: catalogRow.id,
      name: displayName,
      unit_price: price.toFixed(2),
      image_url: null,
      is_subscription: isSubscription,
      stripe_price_id: undefined,
    });

    const count = getItemCount() + 1;
    toast({
      title: "Added to cart",
      description: `Added to cart (${count} ${count === 1 ? 'item' : 'items'})`,
      action: (
        <ToastAction altText="View cart" onClick={() => navigate('/cart')}>
          View cart
        </ToastAction>
      ),
    });
  };

  const handleToggleBillingType = (
    planId: "small" | "medium" | "large",
    type: "subscription" | "oneTime",
  ) => {
    setBillingType((prev) => ({
      ...prev,
      [planId]: type,
    }));
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#f9f7f3" }}>
      {/* Hero Header with Gradient and Animated Halo */}
      <div className="relative bg-gradient-blue-violet text-white pt-14 pb-20 mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>

        {/* Animated Halo Background */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ top: "60px" }}
        >
          <div className="pup-box-halo"></div>
        </div>

        <div className="relative text-center space-y-5 max-w-4xl mx-auto px-6 md:px-8">
          {/* Icon with animated glow */}
          <div className="flex items-center justify-center mb-5">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/40 pup-box-icon-container">
              <Gift
                className="w-12 h-12 drop-shadow-2xl pup-box-gift-icon"
                style={{ color: "#ffffff", stroke: "#ffffff", fill: "none" }}
              />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg">
            Pup Box Subscription
          </h1>

          {/* Main Subheading */}
          <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto font-semibold">
            Curated toys, treats, and essentials delivered for your pup every
            month.
          </p>

          {/* Secondary helper text */}
          <p className="text-base md:text-lg text-white/85 max-w-2xl mx-auto">
            Pick your size, choose monthly or one-time, and we'll handle the
            rest.
          </p>
        </div>
      </div>

      {/* Background Section for Plans & Benefits */}
      <div className="pupbox-section">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Helper Text */}
          <div className="text-center mb-8">
            {!pupboxPlansLoading && !pupboxConfigured && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950 max-w-xl mx-auto"
              >
                Pup Box checkout is disabled until the server has{" "}
                <code className="rounded bg-amber-100 px-1">PUPBOX_CATALOG_JSON</code> set and{" "}
                <code className="rounded bg-amber-100 px-1">npm run store:sync-catalog</code> has been run.
              </div>
            )}
            <p 
              style={{ 
                color: "#111111", 
                fontSize: "1rem",
                maxWidth: "42rem",
                margin: "0 auto"
              }}
            >
              Choose{" "}
              <span style={{ fontWeight: 700, color: "#111111" }}>Subscribe</span>{" "}
              or{" "}
              <span style={{ fontWeight: 700, color: "#111111" }}>One-Time</span>{" "}
              on each box, then click{" "}
              <span style={{ fontWeight: 700, color: "#111111" }}>
                Add to Cart
              </span>
              . You can review everything and check out from your cart when
              you're ready.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`product-card ${plan.id === "medium" ? "pupbox-card--featured" : ""}`}
              >
                {/* Badge positioned at top */}
                {plan.badge && (
                  <div className="pupbox-badge">
                    <span className="inline-flex items-center rounded-full bg-primary-600 text-white text-xs font-semibold px-3 py-1 shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Icon/Visual Header - Royal blue to violet gradient */}
                {/* NO CLASS NAMES to avoid CSS wildcard conflicts */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #0074D4 0%, #6366f1 50%, #8b5cf6 100%)",
                    minHeight: "200px",
                    height: "260px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Icon container - NO CLASS NAMES */}
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "1.5rem",
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "2px solid rgba(255, 255, 255, 0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      position: "relative",
                      zIndex: 10,
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        width: "48px",
                        height: "48px",
                        minWidth: "48px",
                        minHeight: "48px",
                        color: "#ffffff",
                        stroke: "#ffffff",
                        fill: "none",
                        filter: "drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))",
                      }}
                    >
                      <polyline
                        points="20 12 20 22 4 22 4 12"
                        style={{ stroke: "#ffffff" }}
                      />
                      <rect
                        width="20"
                        height="5"
                        x="2"
                        y="7"
                        rx="1"
                        style={{ stroke: "#ffffff", fill: "none" }}
                      />
                      <line
                        x1="12"
                        x2="12"
                        y1="22"
                        y2="7"
                        style={{ stroke: "#ffffff" }}
                      />
                      <path
                        d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
                        style={{ stroke: "#ffffff", fill: "none" }}
                      />
                      <path
                        d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
                        style={{ stroke: "#ffffff", fill: "none" }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Card Body */}
                <div className="product-card__body">
                  <div className="text-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {plan.name} Pup Box
                    </h3>

                    {/* Billing Type Toggle - Enhanced Visual Distinction */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="inline-flex rounded-full p-1 bg-gray-100">
                        <button
                          onClick={() =>
                            requireAuth(() => handleToggleBillingType(plan.id, "subscription"))
                          }
                          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                            billingType[plan.id] === "subscription"
                              ? "bg-primary-600 text-white shadow-md scale-105"
                              : "bg-white text-primary-600 border border-primary-200 hover:border-primary-400"
                          }`}
                          data-testid={`toggle-subscription-${plan.id}`}
                        >
                          Subscribe
                        </button>
                        <button
                          onClick={() =>
                            requireAuth(() => handleToggleBillingType(plan.id, "oneTime"))
                          }
                          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ml-1 ${
                            billingType[plan.id] === "oneTime"
                              ? "bg-primary-600 text-white shadow-md scale-105"
                              : "bg-white text-primary-600 border border-primary-200 hover:border-primary-400"
                          }`}
                          data-testid={`toggle-onetime-${plan.id}`}
                        >
                          One-Time
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Price Display */}
                    <div className="mt-1 mb-3">
                      {billingType[plan.id] === "subscription" ? (
                        <>
                          <div>
                            <span className="text-3xl font-bold text-primary-600">
                              $
                              {resolvePrice(plan.id, "subscription").toFixed(2)}
                            </span>
                            <span
                              className="text-base font-medium"
                              style={{ color: "#555555" }}
                            >
                              &nbsp;/ month
                            </span>
                          </div>
                          <p
                            style={{
                              marginTop: "0.5rem",
                              fontSize: "0.75rem",
                              color: "#444444"
                            }}
                          >
                            Cancel anytime, skip or pause deliveries
                          </p>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-3xl font-bold text-primary-600">
                              $
                              {resolvePrice(plan.id, "oneTime").toFixed(2)}
                            </span>
                            <span
                              className="text-base font-medium"
                              style={{ color: "#555555" }}
                            >
                              &nbsp;one-time
                            </span>
                          </div>
                          <p
                            style={{
                              marginTop: "0.5rem",
                              fontSize: "0.75rem",
                              color: "#444444"
                            }}
                          >
                            Try it out before subscribing
                          </p>
                        </>
                      )}
                    </div>

                    <p
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
                        color: "#111111"
                      }}
                    >
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 mb-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "#111111"
                          }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add to Cart Button */}
                  <div className="product-card__actions">
                    <Button
                      onClick={() => requireAuth(() => handleAddToCart(plan.id))}
                      className="w-full"
                      disabled={pupboxPlansLoading}
                      data-testid={`button-add-to-cart-${plan.id}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-4 pb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Free Shipping
                  </h4>
                  <p className="text-sm" style={{ color: "#555555" }}>
                    Delivered right to your door at no extra cost
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Quality Guaranteed
                  </h4>
                  <p className="text-sm" style={{ color: "#555555" }}>
                    30-day money-back guarantee on all boxes
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg motion-safe:hover:shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Cancel Anytime
                  </h4>
                  <p className="text-sm" style={{ color: "#555555" }}>
                    Skip, pause, or cancel your subscription anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <ListOrdered className="h-6 w-6 text-primary-600" />
              <h2 className="text-xl font-bold text-slate-900">How Pup Box works</h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-2">
              {[
                {
                  step: '1',
                  title: 'Pick a size',
                  body: 'Small, medium, or large—matched to your dog’s weight range so toys and treats fit their needs.',
                },
                {
                  step: '2',
                  title: 'Subscribe or try once',
                  body: 'Choose monthly delivery for recurring joy, or a one-time box to sample the experience.',
                },
                {
                  step: '3',
                  title: 'We curate & ship',
                  body: 'Each cycle blends toys, treats, and essentials with seasonal variety—see plan details above.',
                },
                {
                  step: '4',
                  title: 'Checkout securely',
                  body: 'Add to cart and complete checkout with Stripe. Manage subscriptions from your account when available.',
                },
              ].map((row) => (
                <li
                  key={row.step}
                  className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {row.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{row.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{row.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Rotating value */}
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-5 py-6 text-center md:flex-row md:text-left">
            <Sparkles className="mx-auto h-8 w-8 shrink-0 text-indigo-600 md:mx-0" />
            <div>
              <h3 className="font-semibold text-indigo-950">Fresh picks every cycle</h3>
              <p className="mt-1 text-sm text-indigo-900/90">
                Themes and product mix can rotate by month so your pup stays engaged. Exact SKUs may vary; we
                prioritize safe, high-quality items suited to your selected size tier.
              </p>
            </div>
          </div>

          {/* Policies */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Peace of mind:</span>
            <Link to="/legal/shipping" className="text-primary-600 underline-offset-2 hover:underline">
              Shipping
            </Link>
            <span aria-hidden className="text-slate-300">
              ·
            </span>
            <Link to="/legal/returns" className="text-primary-600 underline-offset-2 hover:underline">
              Returns &amp; refunds
            </Link>
            <span aria-hidden className="text-slate-300">
              ·
            </span>
            <Link to="/contact" className="text-primary-600 underline-offset-2 hover:underline">
              Contact support
            </Link>
          </div>

          {/* FAQ */}
          <div className="mt-10 max-w-3xl mx-auto">
            <h2 className="mb-4 text-center text-xl font-bold text-slate-900">Pup Box FAQ</h2>
            <Accordion type="single" collapsible className="w-full rounded-xl border border-slate-200 bg-white px-2">
              <AccordionItem value="billing">
                <AccordionTrigger className="text-left text-slate-900">
                  When am I charged for a subscription?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Subscription billing follows the schedule shown at checkout (typically monthly from your first
                  successful charge). You can cancel or adjust according to the options we expose in your account
                  and our returns policy.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="skip">
                <AccordionTrigger className="text-left text-slate-900">Can I skip a month?</AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Skip/pause availability depends on your plan and Stripe configuration. If the app offers skip
                  controls, use those; otherwise contact support before your next ship date.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="allergies">
                <AccordionTrigger className="text-left text-slate-900">
                  What if my dog has allergies or dietary needs?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  Review treat ingredients on the packaging when your box arrives. For strict dietary needs, Pup
                  Box may not be suitable—consult your veterinarian and reach out to support for guidance.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="stripe">
                <AccordionTrigger className="text-left text-slate-900">
                  Why does checkout say Stripe?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600">
                  PAWS uses Stripe for secure payments. You will see Stripe branding during checkout; your order
                  still ships as a PAWS Pup Box.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <p className="text-sm text-slate-600">
              Ready to browse the full storefront?{' '}
              <Link to="/marketplace?tab=store" className="font-semibold text-primary-600 underline-offset-2 hover:underline">
                Visit the PAWS store
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// SOL:PUPBOX:END

export default PupBoxSubscription;
