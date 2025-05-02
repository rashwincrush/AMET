'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { 
  FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaLock, 
  FaBell, FaSearch, FaUsers, FaCalendar, FaBriefcase, 
  FaHandshake, FaHome, FaCog, FaUserShield, FaTachometerAlt, 
  FaAnchor, FaBars, FaTimes, FaGraduationCap, FaShip
} from 'react-icons/fa';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function EnhancedHeader() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const mainNavItems = [
    { name: 'Home', href: '/', icon: <FaHome className="w-4 h-4" /> },
    { name: 'Directory', href: '/directory', icon: <FaUsers className="w-4 h-4" /> },
    { name: 'Events', href: '/events', icon: <FaCalendar className="w-4 h-4" /> },
    { name: 'Jobs', href: '/jobs', icon: <FaBriefcase className="w-4 h-4" /> },
    { name: 'Mentorship', href: '/mentorship', icon: <FaHandshake className="w-4 h-4" /> },
    { name: 'About', href: '/about', icon: <FaAnchor className="w-4 h-4" /> },
  ];

  return (
    <header 
      className={`${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800 py-4'
      } sticky top-0 z-50 transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-12 mr-2 bg-white p-1 rounded shadow-sm border border-gray-100 flex items-center justify-center">
                <img 
                  src="/images/amet-logo.jpg" 
                  alt="AMET Logo" 
                  className="h-full object-contain"
                />
              </div>
              <span className={`text-lg font-bold ${scrolled ? 'text-blue-600' : 'text-white'} hidden sm:block transition-colors duration-300`}>
                Alumni
              </span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-1">
              {mainNavItems.slice(0, 5).map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    scrolled 
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                      : 'text-blue-100 hover:text-white hover:bg-blue-700'
                  } flex items-center transition-colors`}
                >
                  <span className="mr-1.5">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`relative rounded-lg shadow-sm hidden md:block ${scrolled ? '' : 'bg-blue-700/30 hover:bg-blue-700/50 border border-blue-400/30'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className={`h-4 w-4 ${scrolled ? 'text-gray-400' : 'text-blue-300'}`} />
              </div>
              <input
                type="text"
                className={`block w-40 sm:w-50 pl-10 pr-3 py-2 border text-sm rounded-lg focus:ring-2 focus:ring-offset-2 ${
                  scrolled 
                    ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700' 
                    : 'border-transparent focus:ring-white focus:border-white bg-transparent text-white placeholder-blue-300'
                }`}
                placeholder="Search alumni, events..."
              />
            </div>
            
            <Link 
              href="/about" 
              className={`hidden md:flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                scrolled 
                  ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                  : 'text-blue-100 hover:text-white hover:bg-blue-700'
              } transition-colors`}
            >
              <FaAnchor className="mr-1.5 w-4 h-4" />
              About
            </Link>

            <button className={`md:hidden p-2 rounded-full ${
              scrolled 
                ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' 
                : 'text-blue-100 hover:text-white hover:bg-blue-700'
            }`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen 
                ? <FaTimes className="h-5 w-5" /> 
                : <FaBars className="h-5 w-5" />
              }
            </button>

            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`p-2 rounded-full ${
                      scrolled 
                        ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-100' 
                        : 'text-blue-100 hover:text-white hover:bg-blue-700'
                    } relative`}>
                      <FaBell className="h-5 w-5" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                          {notifications}
                        </Badge>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 p-2">
                    <div className="p-2 font-medium border-b">Notifications</div>
                    <div className="py-2 px-1">
                      <div className="mb-2 last:mb-0 p-2 hover:bg-gray-50 rounded">
                        <div className="text-sm font-medium">New event: Annual Alumni Reunion</div>
                        <div className="text-xs text-gray-500">5 minutes ago</div>
                      </div>
                      <div className="mb-2 last:mb-0 p-2 hover:bg-gray-50 rounded">
                        <div className="text-sm font-medium">New job posting: Marine Engineer</div>
                        <div className="text-xs text-gray-500">3 hours ago</div>
                      </div>
                      <div className="mb-2 last:mb-0 p-2 hover:bg-gray-50 rounded">
                        <div className="text-sm font-medium">John Smith accepted your mentorship request</div>
                        <div className="text-xs text-gray-500">Yesterday</div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/notifications" className="block text-center text-sm text-blue-600 hover:text-blue-700 p-1">
                      View all notifications
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center rounded-full text-sm focus:outline-none ${
                      scrolled ? 'hover:bg-gray-50' : 'hover:bg-white/50'
                    }`}>
                      <div className={`flex items-center space-x-2 p-1 rounded-full ${
                        scrolled ? 'hover:bg-gray-50' : 'hover:bg-white/50'
                      }`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${
                          scrolled 
                            ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                            : 'bg-white/20 text-white border border-white/30'
                        }`}>
                          {user.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                        <span className={`hidden lg:block text-sm ${
                          scrolled ? 'text-gray-700' : 'text-black'
                        }`}>
                          {user.email?.split('@')[0] || 'User'}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2 border-b">
                      <p className="text-sm font-medium">{user.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center cursor-pointer">
                        <FaUser className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
                        <FaTachometerAlt className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        <FaCog className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="flex items-center cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
             
// Authentication buttons with conditional styling based on scroll position
<div className="hidden md:flex items-center space-x-2">
  <Link href="/auth/login">
    <Button 
      className={`text-sm font-medium flex items-center ${
        scrolled 
          ? 'bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-blue-300' 
          : 'bg-blue-700 text-blue-100 hover:text-white hover:bg-blue-800 border border-blue-600'
      } transition-colors`}
    >
      <FaSignInAlt className="mr-1.5 h-3.5 w-3.5" />
      Sign In
    </Button>
  </Link>
  <Link href="/auth/signup">
    <Button 
      className={`text-sm font-medium flex items-center ${
        scrolled 
          ? 'bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-blue-300' 
          : 'bg-blue-700 text-blue-100 hover:text-white hover:bg-blue-800 border border-blue-600'
      } transition-colors`}
    >
      <FaUserPlus className="mr-1.5 h-3.5 w-3.5" />
      Join Now
    </Button>
  </Link>
</div>
            )}
          </div>
        </div>

        {/* Mobile menu - fixed position for better mobile experience */}
        <div 
          className={`md:hidden fixed inset-x-0 ${scrolled ? 'top-[56px]' : 'top-[72px]'} z-50 transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
        >
          <div className={`${
            scrolled ? 'bg-white shadow-lg' : 'bg-blue-700'
          } py-3 px-4 max-h-[80vh] overflow-y-auto`}>
            <div className="space-y-2">
              {mainNavItems.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className={`flex items-center px-4 py-3 rounded-md text-base font-medium ${
                    scrolled 
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-blue-50' 
                      : 'text-white hover:bg-blue-800 hover:bg-opacity-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3 flex-shrink-0">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>
              
              {/* Search bar for mobile */}
              <div className="relative my-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className={`h-4 w-4 ${scrolled ? 'text-gray-400' : 'text-blue-300'}`} />
                </div>
                <input
                  type="text"
                  className={`block w-full pl-10 pr-3 py-2 border text-sm rounded-lg focus:ring-2 focus:ring-offset-2 ${
                    scrolled 
                      ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white' 
                      : 'border-blue-600 focus:ring-white focus:border-white bg-blue-600 text-white placeholder-blue-300'
                  }`}
                  placeholder="Search alumni, events..."
                />
              </div>
              
              {!user && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Link 
                    href="/auth/login" 
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                      scrolled 
                        ? 'bg-white text-blue-600 border border-blue-600' 
                        : 'bg-blue-600 text-white border border-blue-300'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaSignInAlt className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                      scrolled 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-blue-700'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaUserPlus className="mr-2 h-4 w-4" />
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
