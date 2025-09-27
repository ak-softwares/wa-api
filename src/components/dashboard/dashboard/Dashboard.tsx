// components/Dashboard.tsx
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  MessageSquare, 
  Shield, 
  Globe,
  Headphones
} from 'lucide-react';
import WhatsAppSetupCard from '../setup/WhatsAppSetupCard';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        {/* First Row: WhatsApp Setup Card */}
        <WhatsAppSetupCard />

        {/* Platform Features Card - Compact Horizontal Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-yellow-500" />
              Platform Features
            </CardTitle>
            <CardDescription className="text-sm">
              Everything you get with our free platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Horizontal Features with Icons in a row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/20">
                    <Shield className="h-3 w-3 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Free Forever</p>
                    <p className="text-xs text-muted-foreground">No charges</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="rounded-full bg-blue-100 p-1 dark:bg-blue-900/20">
                    <Zap className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Unlimited API</p>
                    <p className="text-xs text-muted-foreground">No limits</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="rounded-full bg-purple-100 p-1 dark:bg-purple-900/20">
                    <MessageSquare className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Real-time</p>
                    <p className="text-xs text-muted-foreground">Instant messaging</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="rounded-full bg-orange-100 p-1 dark:bg-orange-900/20">
                    <Globe className="h-3 w-3 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">24/7 Support</p>
                    <p className="text-xs text-muted-foreground">Always available</p>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="text-center p-3 border rounded-lg">
                <Badge variant="default" className="mb-2">Active</Badge>
                <div className="text-2xl font-bold text-green-600">99.9%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
            </div>

            <Separator />

            {/* Progress and Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Monthly Usage</span>
                  <span>0 / Unlimited</span>
                </div>
                <Progress value={0} className="h-1" />
              </div>
              
              {/* <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/docs">Docs</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/api-docs">API</Link>
                </Button>
              </div> */}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}