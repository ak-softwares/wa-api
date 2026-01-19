// components/Dashboard.tsx
'use client';

import WhatsAppSetupCard from '../setup/WhatsAppSetupCard';
import AnalyticsCard from '../analytics/AnalyticsCard';
import CreditStatsDemo from '../wallet/WalletCard';

export default function DashboardPage() {
  return (
    <div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <CreditStatsDemo />

        {/* Platform Features Card - Compact Horizontal Layout */}
        <AnalyticsCard />

        {/* First Row: WhatsApp Setup Card */}
        <WhatsAppSetupCard />
      </div>
    </div>
  );
}