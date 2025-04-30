// Static home page that redirects to the dynamic home page
import { redirect } from 'next/navigation';

// This page can be statically generated without issues
export default function Home() {
  // Server component that redirects to the dynamic home page
  redirect('/home');

  // This part won't actually be rendered due to the redirect
  return null;
}
