import '../styles/globals.css';
import '../src/app/globals.css'; // Include App Router styles as well
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Alumni Management System</title>
        <meta name="description" content="Connect with fellow alumni, discover events, and explore career opportunities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default MyApp;
