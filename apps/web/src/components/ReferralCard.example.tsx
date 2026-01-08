// Example: How to use the ReferralCard component in your page

import { ReferralCard } from '@/components/ReferralCard';

export default function HomePage() {
  return (
    <div className="container">
      <h1>Welcome to TMA Boilerplate</h1>
      
      {/* Add the ReferralCard component */}
      <ReferralCard className="my-4" />
      
      {/* Your other content */}
    </div>
  );
}
