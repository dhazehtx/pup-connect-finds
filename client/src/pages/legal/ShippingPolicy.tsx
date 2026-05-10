import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, Globe, Mail } from 'lucide-react';

/**
 * Launch-ready placeholder. Owner should replace processing windows, carriers, and regions
 * with final operational and legal language before going live.
 */
export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Shipping Policy</h1>
          <p className="mt-2 text-sm text-slate-600">
            How PAWS fulfills physical orders, subscription boxes, and store purchases.
          </p>
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong>Owner note:</strong> Replace the illustrative timelines below with your confirmed processing
            times, carriers, and service areas. This page is structured for a quick legal/compliance pass.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-blue-600" />
                Order processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                Most orders are processed within <strong>1–2 business days</strong> after payment confirmation.
                During peak seasons or promotions, processing may take an additional day. You will receive a
                confirmation email when your order ships.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-blue-600" />
                Delivery &amp; carriers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                We ship via major carriers (e.g. USPS, UPS, or FedEx) depending on destination, package size,
                and inventory location. Tracking is provided when available.
              </p>
              <p className="text-sm text-slate-600">
                <strong>Subscription boxes:</strong> Billing cycles and ship windows are aligned with your plan.
                You can manage subscription timing from your account where supported.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="h-5 w-5 text-blue-600" />
                Regions &amp; restrictions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-700">
              <p>
                We currently ship to addresses within the regions PAWS supports at checkout. Some products may
                be unavailable in certain states or countries due to regulations or supplier constraints.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700">
              <p className="mb-3">
                For order issues, damaged shipments, or address changes, contact us through{' '}
                <Link to="/contact" className="font-medium text-blue-600 underline underline-offset-2">
                  Support &amp; Contact
                </Link>
                .
              </p>
              <p className="text-sm text-slate-600">
                Related:{' '}
                <Link to="/legal/returns" className="font-medium text-blue-600 underline underline-offset-2">
                  Returns &amp; refunds
                </Link>
                {' · '}
                <Link to="/legal/terms" className="font-medium text-blue-600 underline underline-offset-2">
                  Terms of Service
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
