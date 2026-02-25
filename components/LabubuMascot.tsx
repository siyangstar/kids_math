import React from 'react';

interface Props {
  className?: string;
  expression?: 'happy' | 'neutral' | 'thinking' | 'excited' | 'wrong';
  width?: number;
}

export const LabubuMascot: React.FC<Props> = React.memo(({ className = "", expression = 'happy', width = 120 }) => {
  const strokeColor = "#3E2723"; // Dark Brown outline
  const furColor = "#D7CCC8"; // Classic Labubu Beige/Grey
  const blushColor = "#FFCDD2";
  
  // Dynamic features based on expression
  let mouthPath = "";
  let teethPath = "";
  let eyeShapeY = 0;
  
  if (expression === 'happy' || expression === 'excited') {
      // Wide open grin with teeth
      mouthPath = "M65 160 Q 100 215, 135 160 Z"; 
      teethPath = "M65 160 L 70 175 L 76 163 L 82 180 L 88 165 L 94 183 L 100 167 L 106 183 L 112 165 L 118 180 L 124 163 L 130 175 L 135 160";
  } else if (expression === 'thinking') {
      // Small O mouth
      mouthPath = "M90 175 Q 100 185, 110 175 Q 100 165, 90 175"; 
      teethPath = "";
  } else if (expression === 'wrong') {
      // Wavy sad mouth
      mouthPath = "M75 180 Q 90 170, 100 180 Q 110 190, 125 180";
      teethPath = "M75 180 L 80 185 L 85 178 L 90 186 L 95 177 L 100 188 L 105 177 L 110 186 L 115 178 L 120 185 L 125 180";
      eyeShapeY = 5; // Eyes look down/sad
  } else {
      // Neutral slight mischievous smile
      mouthPath = "M75 170 Q 100 160, 125 170"; 
      teethPath = "M75 170 L 80 175 L 85 168 L 90 176 L 95 167 L 100 178 L 105 167 L 110 176 L 115 168 L 120 175 L 125 170";
  }

  return (
    <svg width={width} height={width * 1.3} viewBox="0 0 200 260" className={`overflow-visible ${className}`} xmlns="http://www.w3.org/2000/svg">
       {/* Optimization: Removed heavy SVG filters for mobile performance and cleaner vinyl-toy look */}
       
       <g>
          {/* Ears */}
          <path d="M40 90 C 20 20, 60 10, 70 90" fill={furColor} stroke={strokeColor} strokeWidth="4" />
          <path d="M160 90 C 180 20, 140 10, 130 90" fill={furColor} stroke={strokeColor} strokeWidth="4" />
          
          {/* Head Body */}
          <path d="M50 100 C 30 100, 30 220, 100 220 C 170 220, 170 100, 150 100 C 140 80, 60 80, 50 100" 
                fill={furColor} stroke={strokeColor} strokeWidth="4" />
       </g>

       {/* Face Details */}
       <g transform="translate(0, 10)">
           {/* Eyes - Large and oval */}
           <g transform={`translate(0, ${eyeShapeY})`}>
             <ellipse cx="75" cy="135" rx="20" ry="25" fill="white" stroke={strokeColor} strokeWidth="3" />
             <circle cx="75" cy="135" r="8" fill={strokeColor} />
             <circle cx="78" cy="130" r="3" fill="white" opacity="0.8"/>
             
             <ellipse cx="125" cy="135" rx="20" ry="25" fill="white" stroke={strokeColor} strokeWidth="3" />
             <circle cx="125" cy="135" r="8" fill={strokeColor} />
             <circle cx="128" cy="130" r="3" fill="white" opacity="0.8"/>
           </g>

           {/* Blush */}
           <ellipse cx="55" cy="160" rx="12" ry="8" fill={blushColor} opacity="0.6" />
           <ellipse cx="145" cy="160" rx="12" ry="8" fill={blushColor} opacity="0.6" />

           {/* Nose */}
           <path d="M92 155 Q 100 162, 108 155" fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
           
           {/* Mouth Area */}
           <g fill={(expression.includes('happy') || expression.includes('excited')) ? "#5D4037" : "none"}>
              <path d={mouthPath} stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" />
           </g>
           {/* Teeth */}
           <path d={teethPath} fill="none" stroke={(expression.includes('happy') || expression.includes('excited')) ? "white" : strokeColor} strokeWidth="2" strokeLinejoin="round" />
       </g>
       
       {/* Paws/Hands peeking up (optional decoration) */}
       {expression === 'thinking' && (
           <path d="M60 210 Q 70 190, 80 210" fill={furColor} stroke={strokeColor} strokeWidth="3" />
       )}
    </svg>
  );
});
