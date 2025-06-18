
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, X, MapPin, UserPlus, CheckCircle } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  location?: string;
  verified: boolean;
  user_type: 'buyer' | 'breeder' | 'shelter' | 'admin';
}

interface UserSearchBarProps {
  onUserSelect?: (user: UserProfile) => void;
  placeholder?: string;
  showFilters?: boolean;
}

const UserSearchBar = ({ 
  onUserSelect, 
  placeholder = "Search users or breeders...",
  showFilters = true 
}: UserSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'buyer' | 'breeder' | 'shelter' | 'admin'>('all');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchUsers(debouncedSearchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchQuery, verifiedOnly, userTypeFilter]);

  const searchUsers = async (query: string) => {
    setLoading(true);
    try {
      let searchQuery = supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, location, verified, user_type')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(20);

      if (verifiedOnly) {
        searchQuery = searchQuery.eq('verified', true);
      }

      if (userTypeFilter !== 'all') {
        searchQuery = searchQuery.eq('user_type', userTypeFilter);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      setSearchResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: UserProfile) => {
    if (onUserSelect) {
      onUserSelect(user);
    } else {
      navigate(`/profile/${user.id}`);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      searchUsers(searchQuery);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showFilters && (
        <div className="flex gap-2 mt-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded"
            />
            Verified only
          </label>
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value as 'all' | 'buyer' | 'breeder' | 'shelter' | 'admin')}
            className="text-sm px-2 py-1 border rounded"
          >
            <option value="all">All users</option>
            <option value="breeder">Breeders</option>
            <option value="shelter">Shelters</option>
            <option value="buyer">Buyers</option>
          </select>
        </div>
      )}

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No profiles match your search.</p>
            </div>
          ) : (
            <div className="py-2">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {user.full_name || user.username}
                      </span>
                      {user.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {user.user_type === 'breeder' && (
                        <Badge variant="secondary" className="text-xs">
                          Breeder
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>@{user.username}</span>
                      {user.location && (
                        <>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="ml-2">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchBar;
