import React from 'react';

const HeroSection = ({ image, title, subtitle }) => {
  return (
    <div className="relative h-[600px] overflow-hidden mb-15">
      <div className="absolute inset-0 bg-gradient-to-r from-black-100 via-red-800 to-white-300"></div>
      <img 
        src={image} 
        alt="Hero background" 
        className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay opacity-70" 
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white">
        <h1 className="text-6xl font-extrabold mb-4 text-center text-shadow-lg tracking-wide uppercase"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: "'Montserrat', sans-serif"
            }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-2xl mb-8 text-center text-shadow-md max-w-2xl px-4"
             style={{
               textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
               fontFamily: "'Lato', sans-serif"
             }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default HeroSection;