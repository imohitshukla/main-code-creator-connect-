import { useState } from 'react';

interface RoleSelectionProps {
  onSelect: (role: 'brand' | 'creator') => void;
}

const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900">Join as a Client or Creator</h2>
        <p className="mt-2 text-lg text-gray-600">Choose how you want to use Creator Connect.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Card 1: Brand */}
        <div 
          onClick={() => onSelect('brand')}
          className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:border-indigo-500 border-2 border-transparent transition-all group"
        >
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
            💼
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600">I'm a Brand / Agency</h3>
          <p className="mt-2 text-gray-500">I want to hire creators for campaigns and manage payments.</p>
        </div>

        {/* Card 2: Creator */}
        <div 
          onClick={() => onSelect('creator')}
          className="cursor-pointer bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:border-indigo-500 border-2 border-transparent transition-all group"
        >
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 text-2xl">
            🎨
          </div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600">I'm a Creator</h3>
          <p className="mt-2 text-gray-500">I want to find sponsorships and collaborate with brands.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
