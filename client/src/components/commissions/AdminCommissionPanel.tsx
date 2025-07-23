import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Settings2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  BarChart3,
  Edit,
  Save,
  X,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CommissionSettings {
  id: string;
  listing_type: string;
  commission_percent: string;
  flat_fee?: string;
  min_fee?: string;
  max_fee?: string;
  description?: string;
  is_active: boolean;
}

interface CommissionSummary {
  total_earnings: number;
  total_paid_out: number;
  pending_payouts: number;
  transaction_count: number;
  avg_commission_rate: number;
}

export const AdminCommissionPanel: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSettings, setEditingSettings] = useState<CommissionSettings | null>(null);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // Fetch commission settings
  const { data: settingsData } = useQuery({
    queryKey: ['/api/commissions/settings'],
    queryFn: async () => {
      const response = await fetch('/api/commissions/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    }
  });

  // Fetch platform summary
  const { data: summaryData } = useQuery({
    queryKey: ['/api/commissions/admin/summary', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      
      const response = await fetch(`/api/commissions/admin/summary?${params}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    }
  });

  // Fetch commission records
  const { data: commissionsData } = useQuery({
    queryKey: ['/api/commissions/admin/all'],
    queryFn: async () => {
      const response = await fetch('/api/commissions/admin/all?limit=20');
      if (!response.ok) throw new Error('Failed to fetch commissions');
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { listingType: string; settings: Partial<CommissionSettings> }) => {
      const response = await fetch(`/api/commissions/settings/${data.listingType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.settings)
      });
      
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Commission settings have been updated successfully.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/settings'] });
      setSettingsDialog(false);
      setEditingSettings(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Initialize default settings mutation
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/commissions/admin/initialize-settings', {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to initialize settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings Initialized',
        description: 'Default commission settings have been created.',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/commissions/settings'] });
    }
  });

  const handleEditSettings = (setting: CommissionSettings) => {
    setEditingSettings(setting);
    setSettingsDialog(true);
  };

  const handleSaveSettings = () => {
    if (!editingSettings) return;
    
    updateSettingsMutation.mutate({
      listingType: editingSettings.listing_type,
      settings: {
        commission_percent: parseFloat(editingSettings.commission_percent),
        flat_fee: editingSettings.flat_fee ? parseFloat(editingSettings.flat_fee) : undefined,
        min_fee: editingSettings.min_fee ? parseFloat(editingSettings.min_fee) : undefined,
        max_fee: editingSettings.max_fee ? parseFloat(editingSettings.max_fee) : undefined,
        description: editingSettings.description,
        is_active: editingSettings.is_active
      }
    });
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (rate: number) => `${rate.toFixed(1)}%`;

  const settings: CommissionSettings[] = settingsData?.settings || [];
  const summary: CommissionSummary = summaryData?.platform_summary || {
    total_earnings: 0,
    total_paid_out: 0,
    pending_payouts: 0,
    transaction_count: 0,
    avg_commission_rate: 0
  };
  const commissions = commissionsData?.commissions || [];

  const getListingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      puppy: 'Puppy Listings',
      service: 'Pet Services',
      rehoming: 'Rehoming Fees',
      premium: 'Premium Features',
      subscription: 'Subscriptions'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2 className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
            <p className="text-gray-600">Manage platform commission rates and track earnings</p>
          </div>
        </div>
        
        <Button onClick={() => initializeMutation.mutate()} variant="outline">
          Initialize Defaults
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(summary.total_earnings)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(summary.pending_payouts)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{summary.transaction_count}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(summary.avg_commission_rate)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Commission Settings</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rate Configuration</CardTitle>
              <CardDescription>
                Set commission rates and fees for different listing types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{getListingTypeLabel(setting.listing_type)}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {setting.flat_fee ? (
                          <span>Flat fee: {formatCurrency(parseFloat(setting.flat_fee))}</span>
                        ) : (
                          <span>Commission: {formatPercentage(parseFloat(setting.commission_percent))}</span>
                        )}
                        {setting.description && (
                          <span className="text-gray-500">• {setting.description}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={setting.is_active ? "default" : "secondary"}>
                        {setting.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSettings(setting)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Commission Records</CardTitle>
              <CardDescription>Latest commission transactions and payouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissions.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No commission records found</p>
                  </div>
                ) : (
                  commissions.map((commission: any) => (
                    <div
                      key={commission.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getListingTypeLabel(commission.listing_type)}
                          </span>
                          <Badge variant="outline">{commission.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Transaction: {commission.transaction_id.slice(-8)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(parseFloat(commission.platform_fee))}
                        </div>
                        <div className="text-sm text-gray-600">
                          from {formatCurrency(parseFloat(commission.total_amount))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Analytics</CardTitle>
              <CardDescription>Detailed performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Date Range Filter */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label>Date Range:</Label>
                  </div>
                  <Input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-auto"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-auto"
                  />
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Platform Revenue</h4>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(summary.total_earnings)}
                    </p>
                    <p className="text-sm text-green-700">Total commission earned</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Seller Payouts</h4>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(summary.total_paid_out)}
                    </p>
                    <p className="text-sm text-blue-700">Total paid to sellers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Edit Dialog */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Commission Settings</DialogTitle>
            <DialogDescription>
              Update commission rates for {editingSettings && getListingTypeLabel(editingSettings.listing_type)}
            </DialogDescription>
          </DialogHeader>

          {editingSettings && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Commission (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingSettings.commission_percent}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      commission_percent: e.target.value
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Flat Fee ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingSettings.flat_fee || ''}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      flat_fee: e.target.value
                    })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingSettings.description || ''}
                  onChange={(e) => setEditingSettings({
                    ...editingSettings,
                    description: e.target.value
                  })}
                  placeholder="Describe this commission structure..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSettingsDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};