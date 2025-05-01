import { redirect } from 'next/navigation';

// This is a server component that handles the root route
// It uses Next.js server-side redirect which is compatible with static generation
export default function RootPage() {
  // Server-side redirect to /home
  redirect('/home');
}
