import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, Clock, ShieldAlert } from 'lucide-react';

/**
 * Launch-ready placeholder. Owner must align restocking fees, exclusions, and subscription rules
 * with Stripe, fulfillment partners, and counsel.
 */
export default function ReturnsPolicy() {
  useEffect(() => {
    document.title = 'Returns & Refunds — PAWS';
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Returns &amp; Refunds</h1>
          <p className="mt-2 text-sm text-slate-600">
            Our commitment to fair resolutions for store items, subscription boxes, and digital purchases.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/80">
            <CardContent className="flex gap-3 pt-6">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="text-sm text-blue-950">
                Perishable items, opened consumables, and personalized goods may be <strong>non-returnable</strong>{' '}
                unless damaged or incorrect. Final eligibility appears at checkout where applicable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <RotateCcw className="h-5 w-5 text-blue-600" />
                Standard returns (store)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                If you are not satisfied with a qualifying product, you may request a return within{' '}
                <strong>30 days of delivery</strong> for unused items in original packaging, subject to product-specific
                exclusions.
              </p>
              <p className="text-sm text-slate-600">
                Refunds are issued to the original payment method after we receive and inspect the return, typically
                within <strong>5–10 business days</strong> of receipt.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Subscription &amp; Pup Box
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                You may <strong>cancel</strong> a subscription according to the terms shown at purchase. Already-shipped
                boxes generally follow the same damaged/incorrect-item process as other physical goods.
              </p>
              <p className="text-sm text-slate-600">
                Proration, skip months, and refunds for prepaid periods depend on your plan settings in Stripe and
                the options we expose in the app—your finalized policy should match what customers can actually do.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Damaged or wrong items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                Contact us within <strong>48 hours</strong> of delivery with photos of the package and item. We will
                replace or refund eligible orders at our discretion.
              </p>
              <p className="text-sm">
                <Link to="/contact" className="font-medium text-blue-600 underline underline-offset-2">
                  Open a support request
                </Link>
                {' · '}
                <Link to="/legal/shipping" className="font-medium text-blue-600 underline underline-offset-2">
                  Shipping policy
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
