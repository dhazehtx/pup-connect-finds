
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalNetworkDashboard from '@/components/network/ProfessionalNetworkDashboard';
import BreedingPortfolioManager from '@/components/network/BreedingPortfolioManager';
import AdvancedCalendarScheduler from '@/components/scheduling/AdvancedCalendarScheduler';
import EnhancedMobileFeatures from '@/components/mobile/EnhancedMobileFeatures';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

const Network = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('network.professionalNetwork')}</h1>
        <p className="text-muted-foreground mt-2">
          Connect with other professionals, manage your portfolio, and schedule meetings
        </p>
      </div>

      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
        </TabsList>

        <TabsContent value="network" className="space-y-6">
          <ProfessionalNetworkDashboard />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <BreedingPortfolioManager />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <AdvancedCalendarScheduler 
            breederId={user?.id}
            mode="breeder"
          />
        </TabsContent>

        <TabsContent value="mobile" className="space-y-6">
          <EnhancedMobileFeatures />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Network;
