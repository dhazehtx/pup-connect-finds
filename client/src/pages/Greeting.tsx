import React from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* top header */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span role="img" aria-label="heart">💙</span> MY PUP
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-1 rounded-full border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* hero */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Find Your Perfect <br />
          <span className="text-blue-600">Puppy Companion</span>
        </h1>
        <p className="mt-4 max-w-xl text-gray-600">
          Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
        </p>

        {/* hero buttons */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
          >
            Sign Up
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium shadow"
          >
            Browse as Guest
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium shadow w-48"
          >
            Explore Puppies
          </button>
        </div>

        {/* feature bullets */}
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