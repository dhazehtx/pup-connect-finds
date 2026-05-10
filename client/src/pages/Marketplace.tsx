
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import PupBoxSubscription from '@/components/subscriptions/PupBoxSubscription';
import StoreTab from './Marketplace/StoreTab';
import { ServicesTab } from './Services/ServicesTab';
import AdBanner from '@/components/advertising/AdBanner';
import CartFab from '@/components/ui/CartFab';
import MarketplaceTabs from '@/components/MarketplaceTabs';

const TAB_KEYS = ['services', 'box', 'store'] as const;
type MarketplaceTab = (typeof TAB_KEYS)[number];

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<MarketplaceTab>(() => {
    if (tabParam && TAB_KEYS.includes(tabParam as MarketplaceTab)) {
      return tabParam as MarketplaceTab;
    }
    return 'services';
  });

  useEffect(() => {
    if (tabParam && TAB_KEYS.includes(tabParam as MarketplaceTab)) {
      setActiveTab(tabParam as MarketplaceTab);
    }
  }, [tabParam]);

  useEffect(() => {
    document.title = 'Marketplace — PAWS';
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      if (!TAB_KEYS.includes(tab as MarketplaceTab)) return;
      const next = tab as MarketplaceTab;
      setActiveTab(next);
      setSearchParams({ tab: next }, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <div className="marketplace-page min-h-screen bg-slate-50/90 transition-colors duration-200 dark:bg-slate-950">
      <div className="container mx-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6">
        <div className="mb-6 text-center sm:mb-8 sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Services, subscription box, and the store — in one place.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Looking for platform info? Visit{' '}
            <Link to="/services" className="font-medium underline underline-offset-2">
              Services overview
            </Link>
            .
          </p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Something not loading? Try a refresh — providers depend on your network.
          </p>
        </div>

        <AdBanner targetPage="marketplace" format="banner" className="mb-6" />

      <MarketplaceTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="marketplace space-y-6 sm:space-y-8">

          <TabsContent value="services" className="mt-4 space-y-6 focus-visible:outline-none sm:mt-6">
            <ServicesTab />
            <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <AdBanner targetPage="marketplace" format="sponsored" />
              <AdBanner targetPage="marketplace" format="sponsored" />
            </div>
          </TabsContent>

          <TabsContent value="box" className="mt-4 space-y-6 focus-visible:outline-none sm:mt-6">
            <PupBoxSubscription />
          </TabsContent>

          <TabsContent value="store" className="mt-4 space-y-6 focus-visible:outline-none sm:mt-6">
            <StoreTab />
          </TabsContent>
        </Tabs>
      </div>

      <CartFab />
    </div>
  );
};

export default Marketplace;
