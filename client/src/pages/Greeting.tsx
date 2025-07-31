import React from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      {/* Logo + top-right buttons */}
      <header className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur z-20">
        <div className="text-xl font-bold flex items-center gap-2">
          <span role="img" aria-label="heart">💙</span> MY PUP
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 rounded-full border text-blue-600 hover:bg-blue-50"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero section */}
      <section className="text-center mt-32">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Find Your Perfect <br />
          <span className="text-blue-600">Puppy Companion</span>
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-gray-600">
          Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
        </p>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            Sign Up
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 flex items-center gap-2"
          >
            Sign In
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
            onClick={() => navigate('/explore')}
          >
            Browse as Guest
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 flex items-center gap-2"
          >
            Explore Puppies
          </button>
        </div>

        {/* Feature bullets */}
        <ul className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-gray-500">
          <li className="flex items-center gap-1">🟢 Verified Breeders</li>
          <li className="flex items-center gap-1">❤️ Health Guaranteed</li>
          <li className="flex items-center gap-1">⭐ 5-Star Support</li>
        </ul>
      </section>
    </main>
  );
};

export default Greeting;