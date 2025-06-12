
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  Search, 
  Shield, 
  CreditCard,
  BarChart3,
  Settings,
  Heart,
  Bell,
  Map,
  Camera,
  Phone,
  Mail,
  Star,
  Home,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface FeatureStatus {
  name: string;
  description: string;
  status: 'completed' | 'partial' | 'missing';
  completionPercentage: number;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  files?: string[];
}

interface FeatureCategory {
  name: string;
  icon: React.ComponentType<any>;
  features: FeatureStatus[];
  overallCompletion: number;
}

const AppCompletionDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');

  const featureCategories: FeatureCategory[] = [
    {
      name: 'Authentication & User Management',
      icon: Users,
      overallCompletion: 85,
      features: [
        {
          name: 'User Registration/Login',
          description: 'Email/password authentication',
          status: 'completed',
          completionPercentage: 100,
          icon: Users,
          priority: 'high',
          files: ['src/components/auth/AuthForm.tsx', 'src/contexts/AuthContext.tsx']
        },
        {
          name: 'Social Login (Google)',
          description: 'Google OAuth integration',
          status: 'completed',
          completionPercentage: 100,
          icon: Users,
          priority: 'high',
          files: ['src/components/auth/SocialLogin.tsx']
        },
        {
          name: 'Two-Factor Authentication',
          description: '2FA security implementation',
          status: 'completed',
          completionPercentage: 100,
          icon: Shield,
          priority: 'medium',
          files: ['src/components/auth/TwoFactorAuth.tsx']
        },
        {
          name: 'Password Reset',
          description: 'Forgot password functionality',
          status: 'completed',
          completionPercentage: 100,
          icon: Settings,
          priority: 'high',
          files: ['src/components/auth/ForgotPassword.tsx']
        },
        {
          name: 'Email Verification',
          description: 'Email confirmation system',
          status: 'completed',
          completionPercentage: 100,
          icon: Mail,
          priority: 'high',
          files: ['src/components/auth/EmailVerification.tsx']
        },
        {
          name: 'User Profiles',
          description: 'Complete profile management',
          status: 'completed',
          completionPercentage: 90,
          icon: Users,
          priority: 'high',
          files: ['src/components/profile/ProfileEditDialog.tsx']
        }
      ]
    },
    {
      name: 'Messaging & Communication',
      icon: MessageSquare,
      overallCompletion: 95,
      features: [
        {
          name: 'Real-time Chat',
          description: 'Live messaging between users',
          status: 'completed',
          completionPercentage: 100,
          icon: MessageSquare,
          priority: 'high',
          files: ['src/components/messaging/RealTimeChatInterface.tsx']
        },
        {
          name: 'Voice Messages',
          description: 'Audio message recording/playback',
          status: 'completed',
          completionPercentage: 100,
          icon: Phone,
          priority: 'medium',
          files: ['src/components/messaging/VoiceMessageRecorder.tsx']
        },
        {
          name: 'File Sharing',
          description: 'Document and media sharing',
          status: 'completed',
          completionPercentage: 100,
          icon: Camera,
          priority: 'high',
          files: ['src/components/messaging/EnhancedFileShare.tsx']
        },
        {
          name: 'Video Calls',
          description: 'WebRTC video calling',
          status: 'completed',
          completionPercentage: 90,
          icon: Phone,
          priority: 'medium',
          files: ['src/components/video/WebRTCVideoCall.tsx']
        },
        {
          name: 'Message Encryption',
          description: 'End-to-end encryption',
          status: 'completed',
          completionPercentage: 85,
          icon: Shield,
          priority: 'medium',
          files: ['src/components/messaging/EncryptionManager.tsx']
        },
        {
          name: 'Message Search',
          description: 'Advanced message search',
          status: 'completed',
          completionPercentage: 100,
          icon: Search,
          priority: 'low',
          files: ['src/components/messaging/AdvancedMessageSearch.tsx']
        }
      ]
    },
    {
      name: 'Listings & Marketplace',
      icon: Home,
      overallCompletion: 80,
      features: [
        {
          name: 'Create Listings',
          description: 'Add new pet listings',
          status: 'completed',
          completionPercentage: 90,
          icon: Home,
          priority: 'high',
          files: ['src/components/listings/CreateListingForm.tsx']
        },
        {
          name: 'Browse Listings',
          description: 'View and filter listings',
          status: 'completed',
          completionPercentage: 100,
          icon: Search,
          priority: 'high',
          files: ['src/pages/Explore.tsx']
        },
        {
          name: 'Advanced Search',
          description: 'AI-powered search with filters',
          status: 'completed',
          completionPercentage: 95,
          icon: Search,
          priority: 'high',
          files: ['src/components/search/AdvancedSearchInterface.tsx']
        },
        {
          name: 'Favorites System',
          description: 'Save and manage favorite listings',
          status: 'completed',
          completionPercentage: 100,
          icon: Heart,
          priority: 'medium',
          files: ['src/hooks/useFavorites.ts']
        },
        {
          name: 'Listing Analytics',
          description: 'View performance metrics',
          status: 'completed',
          completionPercentage: 85,
          icon: BarChart3,
          priority: 'medium',
          files: ['src/components/analytics/ListingAnalyticsDashboard.tsx']
        },
        {
          name: 'Bulk Listing Management',
          description: 'Manage multiple listings at once',
          status: 'completed',
          completionPercentage: 70,
          icon: Settings,
          priority: 'low',
          files: ['src/components/listings/BulkListingManager.tsx']
        }
      ]
    },
    {
      name: 'Payments & Transactions',
      icon: CreditCard,
      overallCompletion: 75,
      features: [
        {
          name: 'Stripe Integration',
          description: 'Payment processing setup',
          status: 'completed',
          completionPercentage: 90,
          icon: CreditCard,
          priority: 'high',
          files: ['src/components/payments/PaymentIntegration.tsx']
        },
        {
          name: 'Escrow System',
          description: 'Secure payment holding',
          status: 'completed',
          completionPercentage: 80,
          icon: Shield,
          priority: 'high',
          files: ['src/components/payments/EscrowPaymentFlow.tsx']
        },
        {
          name: 'Subscription Plans',
          description: 'Premium membership tiers',
          status: 'completed',
          completionPercentage: 85,
          icon: Star,
          priority: 'medium',
          files: ['src/components/monetization/PricingPlans.tsx']
        },
        {
          name: 'Dispute Resolution',
          description: 'Payment dispute handling',
          status: 'completed',
          completionPercentage: 70,
          icon: AlertTriangle,
          priority: 'medium',
          files: ['src/components/payments/DisputeManagementDashboard.tsx']
        },
        {
          name: 'Refund System',
          description: 'Automated refund processing',
          status: 'partial',
          completionPercentage: 40,
          icon: CreditCard,
          priority: 'medium'
        },
        {
          name: 'Tax Calculation',
          description: 'Automatic tax computation',
          status: 'missing',
          completionPercentage: 0,
          icon: BarChart3,
          priority: 'low'
        }
      ]
    },
    {
      name: 'Trust & Safety',
      icon: Shield,
      overallCompletion: 85,
      features: [
        {
          name: 'User Verification',
          description: 'Identity and business verification',
          status: 'completed',
          completionPercentage: 90,
          icon: Shield,
          priority: 'high',
          files: ['src/components/verification/VerificationDashboard.tsx']
        },
        {
          name: 'Background Checks',
          description: 'Criminal background verification',
          status: 'completed',
          completionPercentage: 85,
          icon: Shield,
          priority: 'high',
          files: ['src/components/safety/BackgroundCheckDashboard.tsx']
        },
        {
          name: 'Reporting System',
          description: 'Report inappropriate content/users',
          status: 'completed',
          completionPercentage: 90,
          icon: AlertTriangle,
          priority: 'high',
          files: ['src/components/safety/ReportingSystem.tsx']
        },
        {
          name: 'Content Moderation',
          description: 'AI-powered content filtering',
          status: 'completed',
          completionPercentage: 80,
          icon: Shield,
          priority: 'high',
          files: ['src/components/moderation/ContentModerationDashboard.tsx']
        },
        {
          name: 'Trust Score System',
          description: 'User trust rating algorithm',
          status: 'completed',
          completionPercentage: 85,
          icon: Star,
          priority: 'medium',
          files: ['src/hooks/useEnhancedProfiles.ts']
        }
      ]
    },
    {
      name: 'Mobile & Performance',
      icon: Phone,
      overallCompletion: 90,
      features: [
        {
          name: 'Mobile Responsive Design',
          description: 'Optimized for mobile devices',
          status: 'completed',
          completionPercentage: 95,
          icon: Phone,
          priority: 'high',
          files: ['src/hooks/useMobileOptimized.ts']
        },
        {
          name: 'PWA Features',
          description: 'Progressive Web App capabilities',
          status: 'completed',
          completionPercentage: 85,
          icon: Zap,
          priority: 'medium',
          files: ['src/components/pwa/PWAInstallPrompt.tsx']
        },
        {
          name: 'Push Notifications',
          description: 'Real-time push notifications',
          status: 'completed',
          completionPercentage: 90,
          icon: Bell,
          priority: 'high',
          files: ['src/components/notifications/PushNotificationManager.tsx']
        },
        {
          name: 'Offline Support',
          description: 'Offline functionality',
          status: 'partial',
          completionPercentage: 60,
          icon: Zap,
          priority: 'low'
        },
        {
          name: 'Performance Optimization',
          description: 'Image compression, lazy loading',
          status: 'completed',
          completionPercentage: 90,
          icon: Zap,
          priority: 'medium',
          files: ['src/components/performance/ImageOptimization.tsx']
        }
      ]
    },
    {
      name: 'AI & Smart Features',
      icon: Zap,
      overallCompletion: 70,
      features: [
        {
          name: 'AI Search',
          description: 'Intelligent search recommendations',
          status: 'completed',
          completionPercentage: 85,
          icon: Search,
          priority: 'medium',
          files: ['src/components/ai/AdvancedAISearch.tsx']
        },
        {
          name: 'Smart Recommendations',
          description: 'Personalized pet recommendations',
          status: 'completed',
          completionPercentage: 80,
          icon: Star,
          priority: 'medium',
          files: ['src/components/recommendations/SmartRecommendationEngine.tsx']
        },
        {
          name: 'Image Analysis',
          description: 'AI-powered image recognition',
          status: 'completed',
          completionPercentage: 75,
          icon: Camera,
          priority: 'low',
          files: ['src/components/ai/ImageAnalyzer.tsx']
        },
        {
          name: 'Chatbot Support',
          description: 'AI customer support',
          status: 'completed',
          completionPercentage: 70,
          icon: MessageSquare,
          priority: 'low',
          files: ['src/components/ai/SupportChatbot.tsx']
        },
        {
          name: 'Fraud Detection',
          description: 'AI-powered fraud prevention',
          status: 'partial',
          completionPercentage: 50,
          icon: Shield,
          priority: 'medium'
        }
      ]
    },
    {
      name: 'Maps & Location',
      icon: Map,
      overallCompletion: 85,
      features: [
        {
          name: 'Interactive Maps',
          description: 'Google Maps integration',
          status: 'completed',
          completionPercentage: 90,
          icon: Map,
          priority: 'high',
          files: ['src/components/maps/EnhancedMapView.tsx']
        },
        {
          name: 'Location-based Search',
          description: 'Find pets by location',
          status: 'completed',
          completionPercentage: 95,
          icon: Search,
          priority: 'high',
          files: ['src/components/location/LocationBasedRecommendations.tsx']
        },
        {
          name: 'Geolocation Services',
          description: 'GPS location detection',
          status: 'completed',
          completionPercentage: 85,
          icon: Map,
          priority: 'medium',
          files: ['src/hooks/useGeolocation.ts']
        },
        {
          name: 'Proximity Alerts',
          description: 'Notify users of nearby pets',
          status: 'partial',
          completionPercentage: 60,
          icon: Bell,
          priority: 'low'
        }
      ]
    }
  ];

  // Calculate overall app completion
  const totalFeatures = featureCategories.reduce((sum, category) => sum + category.features.length, 0);
  const completedFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'completed').length, 0
  );
  const partialFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'partial').length, 0
  );
  const missingFeatures = featureCategories.reduce((sum, category) => 
    sum + category.features.filter(f => f.status === 'missing').length, 0
  );

  const overallCompletion = Math.round(
    featureCategories.reduce((sum, category) => sum + category.overallCompletion, 0) / featureCategories.length
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      case 'missing': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'missing': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
          MY PUP App Completion Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Track the development progress of all features and components
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Overall Progress</p>
                <p className="text-3xl font-bold">{overallCompletion}%</p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completed</p>
                <p className="text-3xl font-bold">{completedFeatures}</p>
                <p className="text-sm text-green-100">{Math.round((completedFeatures/totalFeatures)*100)}% of features</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">In Progress</p>
                <p className="text-3xl font-bold">{partialFeatures}</p>
                <p className="text-sm text-yellow-100">{Math.round((partialFeatures/totalFeatures)*100)}% of features</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Missing</p>
                <p className="text-3xl font-bold">{missingFeatures}</p>
                <p className="text-sm text-red-100">{Math.round((missingFeatures/totalFeatures)*100)}% of features</p>
              </div>
              <XCircle className="w-12 h-12 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featureCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-sm">{category.name}</span>
                  </div>
                  <Progress value={category.overallCompletion} className="h-2" />
                  <p className="text-xs text-gray-600">{category.overallCompletion}% Complete</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feature Breakdown */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {featureCategories.slice(0, 7).map((category, index) => (
            <TabsTrigger key={index} value={category.name.toLowerCase().replace(/\s+/g, '-')}>
              {category.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {featureCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="w-6 h-6 text-blue-600" />
                      {category.name}
                      <Badge className="ml-auto bg-blue-100 text-blue-800">
                        {category.overallCompletion}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {category.features.map((feature) => {
                        const FeatureIcon = feature.icon;
                        return (
                          <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FeatureIcon className="w-5 h-5 text-gray-600" />
                              <div>
                                <h4 className="font-medium">{feature.name}</h4>
                                <p className="text-sm text-gray-600">{feature.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(feature.status)}>
                                {getStatusIcon(feature.status)}
                                <span className="ml-1 capitalize">{feature.status}</span>
                              </Badge>
                              <span className="text-sm font-medium">{feature.completionPercentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {featureCategories.map((category) => (
          <TabsContent 
            key={category.name} 
            value={category.name.toLowerCase().replace(/\s+/g, '-')}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-6 h-6 text-blue-600" />
                  {category.name} - Detailed View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.features.map((feature) => (
                    <div key={feature.name} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{feature.name}</h3>
                        <Badge className={getStatusColor(feature.status)}>
                          {getStatusIcon(feature.status)}
                          <span className="ml-1 capitalize">{feature.status}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-600">{feature.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Completion</span>
                          <span className="text-sm font-medium">{feature.completionPercentage}%</span>
                        </div>
                        <Progress value={feature.completionPercentage} className="h-2" />
                      </div>
                      {feature.files && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Implementation Files:</p>
                          <div className="flex flex-wrap gap-1">
                            {feature.files.map((file, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {file.split('/').pop()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant={feature.priority === 'high' ? 'destructive' : feature.priority === 'medium' ? 'default' : 'secondary'}>
                          {feature.priority} priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AppCompletionDashboard;
