import { redirect } from 'next/navigation';

// This is a server component that handles the /index route
// It uses Next.js server-side redirect which is compatible with static generation
export default function IndexPage() {
  // Server-side redirect to /home
  redirect('/home');
}
