import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  MessageCircle,
  ShoppingBag,
  Gift,
  Truck,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HelpCenter() {
  useEffect(() => {
    document.title = 'Help Center — PAWS';
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 pt-10">
      <div className="mx-auto max-w-5xl space-y-10 px-4">
        <section className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            Help &amp; resources
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Help Center</h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Answers for adoption, services, the PAWS store, and Pup Box—plus links to policies and support.
          </p>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-blue-50/80 p-6 sm:flex sm:items-start sm:gap-4">
          <Shield className="mx-auto h-8 w-8 shrink-0 text-blue-600 sm:mx-0" />
          <div className="mt-3 text-center sm:mt-0 sm:text-left">
            <h2 className="text-lg font-semibold text-slate-900">Trust &amp; safety</h2>
            <p className="mt-1 text-sm text-slate-700">
              Learn how we approach verification, messaging, and community standards—especially when meeting
              breeders or service providers.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Link
                to="/legal/guidelines"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Community guidelines
              </Link>
              <Link
                to="/legal"
                className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Legal guide
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Getting started</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Complete your profile and preferences.</li>
                <li>• Explore listings and save favorites.</li>
                <li>• Use messaging to ask questions before you commit.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Store &amp; checkout</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  •{' '}
                  <Link to="/marketplace?tab=store" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    PAWS store
                  </Link>{' '}
                  for curated products.
                </li>
                <li>• Pay securely via Stripe at checkout.</li>
                <li>
                  • See{' '}
                  <Link to="/legal/shipping" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    shipping
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal/returns" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    returns
                  </Link>
                  .
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <Gift className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Pup Box</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  • Open the{' '}
                  <Link to="/marketplace?tab=box" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    Pup Box
                  </Link>{' '}
                  tab for plans and FAQs.
                </li>
                <li>• Choose subscription or one-time when available.</li>
                <li>• Manage billing from your account when supported.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Account &amp; privacy</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  •{' '}
                  <Link to="/privacy" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    Privacy overview
                  </Link>{' '}
                  and{' '}
                  <Link to="/legal/privacy" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    policy
                  </Link>
                  .
                </li>
                <li>
                  • Adjust settings in{' '}
                  <Link to="/settings" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    Settings
                  </Link>
                  .
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <Truck className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Orders &amp; shipping</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  • Track confirmations in email and visit{' '}
                  <Link to="/orders" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                    Orders
                  </Link>{' '}
                  when signed in.
                </li>
                <li>• Report damaged shipments promptly with photos.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">Contact</h3>
              </div>
              <p className="text-sm text-slate-600">
                For account help, order issues, or safety concerns, reach out through{' '}
                <Link to="/contact" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Contact
                </Link>{' '}
                or{' '}
                <Link to="/support" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Support tickets
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="rounded-xl border border-slate-200 bg-white">
            <AccordionItem value="safe">
              <AccordionTrigger className="px-4 text-left text-slate-900">
                How do I stay safe when meeting breeders or providers?
              </AccordionTrigger>
              <AccordionContent className="px-4 text-slate-600">
                Meet in public when possible, verify identities and paperwork, avoid wiring money to strangers, and
                use in-app messaging so there is a record. Report suspicious behavior from a profile or listing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pay">
              <AccordionTrigger className="px-4 text-left text-slate-900">
                How does payment work for store orders?
              </AccordionTrigger>
              <AccordionContent className="px-4 text-slate-600">
                Checkout is powered by Stripe. You will complete payment on a secure Stripe-hosted page, then return
                to PAWS for confirmation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sub">
              <AccordionTrigger className="px-4 text-left text-slate-900">
                Can I cancel Pup Box?
              </AccordionTrigger>
              <AccordionContent className="px-4 text-slate-600">
                Subscription terms depend on the options shown at purchase and your account controls. See the Pup Box
                tab for details and read the returns policy for physical goods.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="data">
              <AccordionTrigger className="px-4 text-left text-slate-900">
                Where can I export or delete my data?
              </AccordionTrigger>
              <AccordionContent className="px-4 text-slate-600">
                Open{' '}
                <Link to="/privacy" className="font-medium text-blue-600 underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>{' '}
                for data practices; signed-in users can also manage options under Settings when available.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </div>
    </main>
  );
}
