
import React, { useState } from 'react';
import { ArrowLeft, Camera, Image, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Post = () => {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-4 border-b flex items-center justify-between">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">New Post</h1>
        <button className="text-blue-500 font-semibold">Share</button>
      </div>

      <div className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <Camera size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Add Photo</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24"
            />
          </div>

          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
            <MapPin size={20} className="text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="flex-1 outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button className="flex-1 p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2">
              <Camera size={20} />
              <span>Camera</span>
            </button>
            <button className="flex-1 p-3 border border-gray-200 rounded-lg flex items-center justify-center gap-2">
              <Image size={20} />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
