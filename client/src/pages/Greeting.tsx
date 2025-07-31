import React from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* top header – white bar with logo, search, auth buttons */}
      <header className="flex items-center gap-6 px-8 py-3 bg-white shadow-sm border-b">
        {/* logo */}
        <span className="flex items-center gap-2 text-xl font-bold whitespace-nowrap">
          💙 MY PUP
        </span>

        {/* search bar */}
        <input
          type="text"
          placeholder="Search puppies, breeds, or breeders…"
          className="flex-1 max-w-lg px-4 py-2 bg-gray-100 rounded-md text-sm focus:outline-none"
        />

        {/* mini auth buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700"
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
          Connect with verified breeders and discover adorable, healthy puppies
          waiting for their forever homes.
        </p>

        {/* pill buttons row */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/auth')}
            className="w-32 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow font-medium"
          >
            Sign Up
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="w-32 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow font-medium"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="w-32 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow font-medium"
          >
            Browse as Guest
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="w-48 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow font-medium"
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