// components/Dashboard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WhatsAppSetupCard from '../setup/WhatsAppSetupCard';
import AnalyticsCard from '../analytics/AnalyticsCard';
import CreditStatsDemo from '../wallet/WalletCard';

export default function DashboardPage() {

  const StatsCard = ({ title, value, description, icon: Icon, trend }: { title: string; value: string; description: string; icon: any; trend?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant={trend.includes('+') ? "default" : "secondary"} className="mt-2">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard
          title="Platform Status"
          value="Free & Active"
          description="Lifetime free access"
          icon={Shield}
          trend="No charges"
        />
        <StatsCard
          title="API Usage"
          value="Unlimited"
          description="Messages this month"
          icon={Zap}
          trend="0/∞ used"
        />
        <StatsCard
          title="Support"
          value="Available"
          description="24/7 assistance"
          icon={Headphones}
          trend="Always online"
        />
      </div> */}
      
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