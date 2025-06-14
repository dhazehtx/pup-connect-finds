
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Heart, Search, Shield, Star, Users, PawPrint } from 'lucide-react';

const Home = () => {
  const { user, isGuest, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect <span className="text-blue-600">Puppy Companion</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with trusted breeders, verified sellers, and loving families. 
            Discover your next best friend with confidence and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/explore" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              <Search className="inline-block w-5 h-5 mr-2" />
              Browse Puppies
            </Link>
            {!user && (
              <Link 
                to="/auth" 
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MY PUP?</h2>
            <p className="text-xl text-gray-600">Trusted by thousands of families nationwide</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Breeders</h3>
              <p className="text-gray-600">All breeders are thoroughly vetted and verified for your peace of mind.</p>
            </div>
            
            <div className="text-center p-6">
              <Star className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Health certificates and genetic testing ensure healthy, happy puppies.</p>
            </div>
            
            <div className="text-center p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trusted Community</h3>
              <p className="text-gray-600">Join thousands of satisfied families who found their perfect companion.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Breeds Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Breeds</h2>
            <p className="text-xl text-gray-600">Discover the most loved companion breeds</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Golden Retriever', 'Labrador', 'German Shepherd', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler', 'Husky'].map((breed) => (
              <Link 
                key={breed}
                to={`/explore?breed=${breed.toLowerCase().replace(' ', '-')}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <PawPrint className="h-8 w-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-gray-900">{breed}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Perfect Puppy?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of happy families today</p>
          <Link 
            to="/explore" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg inline-flex items-center"
          >
            <Search className="w-5 h-5 mr-2" />
            Start Browsing Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
