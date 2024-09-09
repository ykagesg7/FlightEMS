import React from 'react';

const HeroSection = ({ image, title, subtitle, gradient }) => {
  return (
    <div className={`relative h-[600px] bg-gradient-${gradient} from-gray-900 to-blue-900 overflow-hidden mb-16`}>
      <img 
        src={image} 
        alt="Hero background" 
        className="absolute inset-0 w-full h-full object-contain object-center" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white">
        <h1 className="text-6xl font-bold mb-4 text-center text-shadow-lg">{title}</h1>
        {subtitle && <p className="text-2xl mb-8 text-center text-shadow-md">{subtitle}</p>}
      </div>
    </div>
  );
};

export default HeroSection;