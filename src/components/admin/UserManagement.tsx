
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  CheckCircle,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: 'buyer' | 'breeder' | 'shelter' | 'admin';
  verified: boolean;
  created_at: string;
  last_seen: string;
  status: 'active' | 'suspended' | 'pending';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyer' | 'breeder' | 'shelter'>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john@example.com',
        full_name: 'John Doe',
        user_type: 'buyer',
        verified: true,
        created_at: '2024-01-15',
        last_seen: '2024-01-20',
        status: 'active'
      },
      {
        id: '2',
        email: 'sarah@breeder.com',
        full_name: 'Sarah Wilson',
        user_type: 'breeder',
        verified: false,
        created_at: '2024-01-10',
        last_seen: '2024-01-19',
        status: 'pending'
      },
      {
        id: '3',
        email: 'shelter@rescue.org',
        full_name: 'Happy Paws Shelter',
        user_type: 'shelter',
        verified: true,
        created_at: '2024-01-05',
        last_seen: '2024-01-20',
        status: 'active'
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.user_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, verified: true, status: 'active' as const } : user
    ));
    toast({
      title: "User Verified",
      description: "User has been successfully verified.",
    });
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: 'suspended' as const } : user
    ));
    toast({
      title: "User Suspended",
      description: "User has been suspended.",
      variant: "destructive"
    });
  };

  const getStatusBadge = (status: string, verified: boolean) => {
    if (status === 'suspended') {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'breeder': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'shelter': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="buyer">Buyers</option>
              <option value="breeder">Breeders</option>
              <option value="shelter">Shelters</option>
            </select>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getUserTypeIcon(user.user_type)}
                  <div>
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(user.status, user.verified)}
                  
                  <div className="flex gap-2">
                    {!user.verified && user.status !== 'suspended' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyUser(user.id)}
                        className="text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verify
                      </Button>
                    )}
                    
                    {user.status !== 'suspended' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-3 h-3 mr-1" />
                        Suspend
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserManagement;
