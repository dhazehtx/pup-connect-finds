import React from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* header with search bar */}
      <header className="flex items-center gap-6 px-8 py-3 bg-white shadow">
        {/* logo */}
        <div className="flex items-center gap-2 text-xl font-bold">
          💙 MY PUP
        </div>

        {/* search field */}
        <input
          type="text"
          placeholder="Search puppies, breeds, or breeders…"
          className="flex-1 max-w-lg px-4 py-2 rounded-md border bg-gray-50 focus:outline-none"
        />

        {/* auth buttons (mini) */}
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm"
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

        {/* four blue pill buttons with icons in one row */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={() => navigate('/auth')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            👤 Sign Up
          </button>
          <button 
            onClick={() => navigate('/auth')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            🔑 Sign In
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            👁 Browse as Guest
          </button>
          <button 
            onClick={() => navigate('/explore')}
            className="flex items-center justify-center gap-2 px-6 py-3 w-48 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            🐾 Explore Puppies
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