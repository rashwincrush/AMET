import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 m-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-700 mb-6">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/home" 
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
