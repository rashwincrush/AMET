// Skip static generation completely for the root page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

// Import redirect function
import { redirect } from 'next/navigation';

export default function Home() {
  // Server component that redirects to the dynamic home page
  redirect('/home');

  // This part won't actually be rendered due to the redirect
  return null;
}
