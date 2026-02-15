import type { TelegramUser } from '@tma/shared';
import { User, Star, Globe } from 'lucide-react';

interface UserInfoCardProps {
  user: TelegramUser | null;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        User Information
      </h2>
      
      {user ? (
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={user.first_name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {user.first_name[0]}
              </div>
            )}
            {user.is_premium && (
              <Star className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          
          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user.first_name} {user.last_name || ''}
            </p>
            {user.username && (
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            )}
            <div className="flex gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                ID: {user.id}
              </span>
              {user.language_code && (
                <span className="inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  <Globe className="w-3 h-3" /> {user.language_code.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No user data available</p>
      )}
    </section>
  );
}
