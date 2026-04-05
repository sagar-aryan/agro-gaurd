import React, { useEffect, useState } from 'react';
import './StartupAnimation.css';

export default function StartupAnimation({ onComplete }) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
      setTimeout(onComplete, 600); // Wait for CSS fade out transition
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`startup-screen ${!animating ? 'fade-out' : ''}`}>
      <div className="animation-container">
        {/* The Droplet falling */}
        <div className="droplet" />
        
        {/* The Earth */}
        <div className="earth-wrapper">
          <svg viewBox="0 0 200 200" className="earth-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="earth-clip">
                <circle cx="100" cy="100" r="95" />
              </clipPath>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {/* Base Earth - Dry Brown */}
            <circle cx="100" cy="100" r="95" className="earth-base-dry" />
            
            {/* Continents - Dry */}
            <path 
              d="M 40 50 Q 70 30, 90 60 T 140 40 Q 170 80, 150 120 T 100 160 Q 60 170, 50 110 Z" 
              clipPath="url(#earth-clip)"
              className="continent-dry"
            />
            <path 
              d="M 120 100 Q 150 80, 180 110 T 150 170 Q 110 140, 120 100 Z" 
              clipPath="url(#earth-clip)"
              className="continent-dry"
            />
            
            {/* Green overlay with mask to act as a ripple reveal */}
            <g className="earth-green-group">
              <circle cx="100" cy="100" r="95" className="earth-base-green" />
              <path 
                d="M 40 50 Q 70 30, 90 60 T 140 40 Q 170 80, 150 120 T 100 160 Q 60 170, 50 110 Z" 
                clipPath="url(#earth-clip)"
                className="continent-green"
              />
              <path 
                d="M 120 100 Q 150 80, 180 110 T 150 170 Q 110 140, 120 100 Z" 
                clipPath="url(#earth-clip)"
                className="continent-green"
              />
            </g>

            {/* The expanding ripple overlay covering the green mask */}
            <circle cx="100" cy="0" r="0" className="ripple-mask-circle" fill="white" />
          </svg>
        </div>
        
      </div>
    </div>
  );
}
