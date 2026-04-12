import React from 'react';

export default function MysticLayout({ children, className = '' }) {
  return (
    <main className={`pt-24 pb-32 px-6 max-w-4xl mx-auto lotus-pattern min-h-screen ${className}`}>
      {children}
    </main>
  );
}
