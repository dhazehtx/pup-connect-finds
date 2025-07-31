import React from 'react';
import { useNavigate } from 'react-router-dom';

const Greeting = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* HEADER ─ logo left, auth buttons right */}
      <header className="flex items-center justify-between px-8 py-3 bg-white shadow-sm">
        <span className="text-xl font-bold flex items-center gap-2">💙 MY PUP</span>
        <div className="flex gap-3">
          <button onClick={() => navigate('/auth')} className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm">Sign In</button>
          <button onClick={() => navigate('/auth')} className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm">Sign Up</button>
        </div>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Find Your Perfect <br />
          <span className="text-blue-600">Puppy Companion</span>
        </h1>

        <p className="mt-4 max-w-xl text-gray-600">
          Connect with verified breeders and discover adorable, healthy puppies waiting for their forever homes.
        </p>

        {/* ROW 1 – three pills */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <button onClick={() => navigate('/auth')} className="w-[154px] px-6 py-3 rounded-full bg-blue-600 text-white font-medium flex justify-center items-center gap-2 shadow hover:bg-blue-700">
            <span className="text-sm">👤</span> Sign Up
          </button>
          <button onClick={() => navigate('/auth')} className="w-[154px] px-6 py-3 rounded-full bg-blue-600 text-white font-medium flex justify-center items-center gap-2 shadow hover:bg-blue-700">
            <span className="text-sm">🔑</span> Sign In
          </button>
          <button onClick={() => navigate('/explore')} className="w-[154px] px-6 py-3 rounded-full bg-blue-600 text-white font-medium flex justify-center items-center gap-2 shadow hover:bg-blue-700">
            <span className="text-sm">👀</span> Browse as Guest
          </button>
        </div>

        {/* ROW 2 – wide Explore button */}
        <button onClick={() => navigate('/explore')} className="mt-4 w-[220px] px-6 py-3 rounded-full bg-blue-600 text-white font-medium flex justify-center items-center gap-2 shadow hover:bg-blue-700">
          <span className="text-sm">🔍</span> Explore Puppies
        </button>

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