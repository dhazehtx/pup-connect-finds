
import React from 'react';
import { useParams } from 'react-router-dom';

const DogDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Dog Detail</h1>
      <p>Dog ID: {id}</p>
    </div>
  );
};

export default DogDetail;
