// pages/_app.js
import { Analytics } from "@vercel/analytics/react";
import '../styles/globals.css'; // Import global CSS here

import { useRouter } from 'next/router';
import { ClerkProvider } from "@clerk/nextjs";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <ClerkProvider>
      <div className={isHomePage ? 'noBackground' : 'background'}>
        <Component {...pageProps} />
        <Analytics /> {/* Analytics component added here */}
      </div>
    </ClerkProvider>
  );
}

export default MyApp;
