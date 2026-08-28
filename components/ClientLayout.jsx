'use client';

import { useState } from 'react';
import SplashScreen from "@/components/SplashScreen";

export default function ClientLayout({ children }) {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <main className="w-full flex-1 overflow-x-hidden">
        {children}
      </main>
    </>
  );
}