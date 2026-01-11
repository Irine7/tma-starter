'use client';

import { usePathname, useRouter } from 'next/navigation';
import { User, Trophy, Users, Wallet, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/',
  },
  {
    id: 'ratings',
    label: 'Ratings',
    icon: Trophy,
    path: '/ratings',
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: Users,
    path: '/friends',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: Wallet,
    path: '/wallet',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border/50 pb-safe z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className="flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors"
              >
                <div className={`
                  transition-all duration-200
                  ${isActive 
                    ? 'text-primary dark:text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`
                  text-xs font-medium transition-colors
                  ${isActive 
                    ? 'text-primary dark:text-primary' 
                    : 'text-muted-foreground'
                  }
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* iPhone Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-foreground/20 rounded-full" />
      </div>
    </nav>
  );
}
