import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Star, User } from 'lucide-react';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/brevedu-plus', icon: Star, label: 'Plus' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-primary border-t border-dark-tertiary md:hidden z-50">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              isActive(path)
                ? path === '/brevedu-plus' 
                  ? 'text-yellow-primary' 
                  : 'text-purple-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;