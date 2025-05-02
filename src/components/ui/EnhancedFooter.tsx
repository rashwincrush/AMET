'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  FaFacebook, FaTwitter, FaLinkedin, FaInstagram, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBullhorn,
  FaUsers, FaCalendar, FaBriefcase, FaHandshake,
  FaInfoCircle, FaQuestion, FaShieldAlt, FaGraduationCap
} from 'react-icons/fa';
import { useState } from 'react';

export default function EnhancedFooter() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'Alumni Directory', href: '/directory', icon: <FaUsers className="w-4 h-4" /> },
    { name: 'Events', href: '/events', icon: <FaCalendar className="w-4 h-4" /> },
    { name: 'Jobs', href: '/jobs', icon: <FaBriefcase className="w-4 h-4" /> },
    { name: 'Mentorship', href: '/mentorship', icon: <FaHandshake className="w-4 h-4" /> },
  ];

  const supportLinks = [
    { name: 'About Us', href: '/about', icon: <FaInfoCircle className="w-4 h-4" /> },
    { name: 'FAQ', href: '/faq', icon: <FaQuestion className="w-4 h-4" /> },
    { name: 'Privacy Policy', href: '/privacy', icon: <FaShieldAlt className="w-4 h-4" /> },
    { name: 'Terms of Service', href: '/terms', icon: <FaGraduationCap className="w-4 h-4" /> },
  ];

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-2">A</div>
              <span className="text-xl font-bold text-white">AMET Alumni</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Connecting AMET alumni through a comprehensive platform for networking, events, career opportunities, and mentorship.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <span className="mr-2">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-2 text-gray-400 mb-6">
              <li className="flex items-center">
                <FaEnvelope className="mr-2 w-4 h-4 text-gray-500" />
                <span>info@ametalumni.in</span>
              </li>
              <li className="flex items-center">
                <FaPhone className="mr-2 w-4 h-4 text-gray-500" />
                <span>+91 6382111569</span>
              </li>
              <li className="flex items-center">
                <FaMapMarkerAlt className="mr-2 w-4 h-4 text-gray-500" />
                <span>135, SH 49, Kanathur , Chennai - 600097</span>
              </li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-2 text-white">Newsletter</h3>
            <form onSubmit={handleSubscribe} className="mt-2">
              <div className="flex">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-l-md focus:outline-none bg-gray-700 text-white border border-gray-600 flex-grow" 
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition-colors flex items-center"
                >
                  <FaBullhorn className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="text-green-400 text-sm mt-1">Thanks for subscribing!</p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center sm:text-left">
            &copy; {new Date().getFullYear()} AMET Alumni Management. All rights reserved.
          </p>
          <div className="mt-2 sm:mt-0 flex flex-wrap justify-center space-x-4">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>

      <button 
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all hidden md:block focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
}
