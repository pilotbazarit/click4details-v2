'use client'
import { useEffect, useState } from 'react';

const MouseTrail = () => {
  const [trails, setTrails] = useState([]);

  useEffect(() => {
    let animationFrameId;

    const handleMouseMove = (e) => {
      const newTrail = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };

      setTrails((prevTrails) => {
        const updatedTrails = [...prevTrails, newTrail];
        // Keep only the last 15 trail points
        return updatedTrails.slice(-15);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Clean up old trails
    const interval = setInterval(() => {
      setTrails((prevTrails) => {
        if (prevTrails.length === 0) return prevTrails;
        return prevTrails.slice(1);
      });
    }, 50);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {trails.map((trail, index) => {
        const opacity = (index + 1) / trails.length;
        const scale = (index + 1) / trails.length;

        return (
          <div
            key={trail.id}
            className="absolute rounded-full transition-all duration-300"
            style={{
              left: trail.x - 10,
              top: trail.y - 10,
              width: '20px',
              height: '20px',
              background: `radial-gradient(circle, rgba(59, 130, 246, ${opacity}) 0%, rgba(147, 51, 234, ${opacity * 0.5}) 100%)`,
              opacity: opacity,
              transform: `scale(${scale})`,
              animation: 'pulse 0.5s ease-out',
            }}
          />
        );
      })}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default MouseTrail;


// 'use client'
// import { useEffect, useState } from 'react';

// const MouseTrail = () => {
//   const [trails, setTrails] = useState([]);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [mouseVelocity, setMouseVelocity] = useState({ x: 0, y: 0 });
//   const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
//   const [wheelRotation, setWheelRotation] = useState(0);

//   useEffect(() => {
//     let animationFrameId;

//     const handleMouseMove = (e) => {
//       // Calculate velocity for car rotation and speed effects
//       const velocityX = e.clientX - lastMousePosition.x;
//       const velocityY = e.clientY - lastMousePosition.y;
//       const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

//       setMouseVelocity({ x: velocityX, y: velocityY });
//       setLastMousePosition({ x: e.clientX, y: e.clientY });
//       setMousePosition({ x: e.clientX, y: e.clientY });

//       // Rotate wheels based on speed
//       setWheelRotation(prev => (prev + speed * 5) % 360);

//       // Create smoke particles based on speed (faster = more smoke)
//       const particleCount = Math.max(2, Math.min(5, Math.floor(speed / 3)));
//       const newTrails = [];

//       for (let i = 0; i < particleCount; i++) {
//         const spread = 12;
//         const offsetX = (Math.random() - 0.5) * spread;
//         const offsetY = (Math.random() - 0.5) * spread;

//         // Smoke comes from behind the car
//         const angle = Math.atan2(velocityY, velocityX);
//         const exhaustX = e.clientX - Math.cos(angle) * 20;
//         const exhaustY = e.clientY - Math.sin(angle) * 20;

//         newTrails.push({
//           id: Date.now() + Math.random() + i,
//           x: exhaustX + offsetX,
//           y: exhaustY + offsetY,
//           size: Math.random() * 12 + 8 + speed * 0.3,
//           speedX: (Math.random() - 0.5) * 2,
//           speedY: Math.random() * 1 + 0.5,
//           rotation: Math.random() * 360,
//           birthTime: Date.now(),
//         });
//       }

//       setTrails((prevTrails) => {
//         const updatedTrails = [...prevTrails, ...newTrails];
//         // Keep more particles for denser smoke
//         return updatedTrails.slice(-60);
//       });
//     };

//     window.addEventListener('mousemove', handleMouseMove);

//     // Clean up old trails
//     const interval = setInterval(() => {
//       setTrails((prevTrails) => {
//         if (prevTrails.length === 0) return prevTrails;
//         return prevTrails.slice(3); // Remove 3 at a time
//       });
//     }, 50);

//     return () => {
//       window.removeEventListener('mousemove', handleMouseMove);
//       clearInterval(interval);
//       if (animationFrameId) {
//         cancelAnimationFrame(animationFrameId);
//       }
//     };
//   }, [lastMousePosition]);

//   // Calculate car rotation based on movement direction
//   const carAngle = Math.atan2(mouseVelocity.y, mouseVelocity.x) * (180 / Math.PI);
//   const speed = Math.sqrt(mouseVelocity.x * mouseVelocity.x + mouseVelocity.y * mouseVelocity.y);

//   return (
//     <div className="pointer-events-none fixed inset-0 z-50">
//       {/* Exhaust Smoke - Realistic particles */}
//       {trails.map((trail, index) => {
//         const age = Date.now() - trail.birthTime;
//         const lifeProgress = age / 2000; // 2 seconds lifetime
//         const opacity = Math.max(0, 1 - lifeProgress);
//         const scale = 1 + lifeProgress * 2; // Smoke expands as it ages

//         // Position changes over time (smoke drifts)
//         const driftX = trail.speedX * lifeProgress * 20;
//         const driftY = trail.speedY * lifeProgress * 20;

//         // Color transitions: car exhaust (dark gray/black smoke)
//         const isYoung = lifeProgress < 0.2;
//         const background = isYoung
//           ? `radial-gradient(circle,
//               rgba(140, 140, 140, ${opacity * 0.7}) 0%,
//               rgba(100, 100, 100, ${opacity * 0.5}) 40%,
//               rgba(70, 70, 70, ${opacity * 0.3}) 70%,
//               rgba(50, 50, 50, ${opacity * 0.2}) 100%)`
//           : `radial-gradient(circle,
//               rgba(90, 90, 90, ${opacity * 0.5}) 0%,
//               rgba(70, 70, 70, ${opacity * 0.3}) 50%,
//               rgba(50, 50, 50, ${opacity * 0.15}) 100%)`;

//         return (
//           <div
//             key={trail.id}
//             className="absolute rounded-full"
//             style={{
//               left: trail.x + driftX - trail.size / 2,
//               top: trail.y + driftY - trail.size / 2,
//               width: `${trail.size}px`,
//               height: `${trail.size}px`,
//               background: background,
//               opacity: opacity,
//               transform: `scale(${scale}) rotate(${trail.rotation}deg)`,
//               filter: `blur(${4 + lifeProgress * 6}px)`, // Smoke blurs more over time
//               transition: 'all 0.1s linear',
//             }}
//           />
//         );
//       })}

//       {/* Car exhaust glow - more visible when moving fast */}
//       <div
//         className="absolute"
//         style={{
//           left: mousePosition.x - 30,
//           top: mousePosition.y - 20,
//           width: '60px',
//           height: '40px',
//           background: `radial-gradient(ellipse, rgba(100, 100, 100, ${Math.min(0.6, speed * 0.05)}) 0%, rgba(80, 80, 80, ${Math.min(0.3, speed * 0.03)}) 50%, transparent 70%)`,
//           filter: 'blur(10px)',
//           transform: `rotate(${carAngle}deg)`,
//           pointerEvents: 'none',
//           opacity: speed > 1 ? 1 : 0,
//         }}
//       />

//       {/* Realistic Race Car with SVG */}
//       <div
//         className="absolute transition-transform duration-75"
//         style={{
//           left: mousePosition.x - 30,
//           top: mousePosition.y - 20,
//           transform: `rotate(${carAngle}deg)`,
//           transformOrigin: 'center',
//         }}
//       >
//         {/* Car Body */}
//         <svg width="60" height="40" viewBox="0 0 60 40" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))' }}>
//           {/* Car Shadow */}
//           <ellipse cx="30" cy="38" rx="22" ry="4" fill="rgba(0, 0, 0, 0.3)" />

//           {/* Main Body */}
//           <path d="M 10 25 Q 8 20, 12 18 L 20 18 L 25 12 L 40 12 L 45 18 L 48 18 Q 52 20, 50 25 L 48 28 Q 52 28, 52 32 Q 52 35, 48 35 L 12 35 Q 8 35, 8 32 Q 8 28, 12 28 Z"
//                 fill="#e74c3c" stroke="#c0392b" strokeWidth="1"/>

//           {/* Windshield */}
//           <path d="M 26 13 L 30 16 L 38 16 L 39 13 Z" fill="rgba(135, 206, 250, 0.6)" stroke="#2c3e50" strokeWidth="0.5"/>

//           {/* Side Window */}
//           <rect x="32" y="18" width="10" height="6" rx="1" fill="rgba(135, 206, 250, 0.5)" stroke="#2c3e50" strokeWidth="0.5"/>

//           {/* Front Lights */}
//           <circle cx="48" cy="22" r="2.5" fill="#ffeb3b" opacity="0.9"/>
//           <circle cx="48" cy="28" r="2.5" fill="#ffeb3b" opacity="0.9"/>

//           {/* Racing Stripe */}
//           <rect x="15" y="20" width="30" height="2" fill="white" opacity="0.8"/>

//           {/* Back Wheel */}
//           <g transform={`translate(18, 32)`}>
//             <circle cx="0" cy="0" r="6" fill="#34495e" stroke="#2c3e50" strokeWidth="1"/>
//             <circle cx="0" cy="0" r="3.5" fill="#95a5a6"/>
//             <g transform={`rotate(${wheelRotation})`}>
//               <line x1="-3" y1="0" x2="3" y2="0" stroke="#2c3e50" strokeWidth="1"/>
//               <line x1="0" y1="-3" x2="0" y2="3" stroke="#2c3e50" strokeWidth="1"/>
//             </g>
//           </g>

//           {/* Front Wheel */}
//           <g transform={`translate(42, 32)`}>
//             <circle cx="0" cy="0" r="6" fill="#34495e" stroke="#2c3e50" strokeWidth="1"/>
//             <circle cx="0" cy="0" r="3.5" fill="#95a5a6"/>
//             <g transform={`rotate(${wheelRotation})`}>
//               <line x1="-3" y1="0" x2="3" y2="0" stroke="#2c3e50" strokeWidth="1"/>
//               <line x1="0" y1="-3" x2="0" y2="3" stroke="#2c3e50" strokeWidth="1"/>
//             </g>
//           </g>

//           {/* Speed Lines (when moving fast) */}
//           {speed > 5 && (
//             <g opacity={Math.min(0.7, speed * 0.05)}>
//               <line x1="5" y1="20" x2="10" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
//               <line x1="3" y1="25" x2="8" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
//               <line x1="5" y1="30" x2="10" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
//             </g>
//           )}
//         </svg>
//       </div>

//       <style jsx>{`
//         @keyframes smokeRise {
//           0% {
//             transform: translateY(0) scale(0.8);
//             opacity: 0.8;
//           }
//           100% {
//             transform: translateY(-30px) scale(2);
//             opacity: 0;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default MouseTrail;
