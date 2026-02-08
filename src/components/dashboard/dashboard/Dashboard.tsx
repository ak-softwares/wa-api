'use client';

import WhatsAppSetupCard from '../setup/WhatsAppSetupCard';
import AnalyticsCard from '../analytics/AnalyticsCard';
import CreditStatsDemo from '../wallet/WalletCard';
import { YouTubeHelpCard } from '@/components/common/iframe/youTubeEmbedIframe';
import { YOUTUBE_VIDEOS } from '@/utiles/constans/youtubeHelp';

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

        {/* Second Row: YouTube Help Card */}
        <YouTubeHelpCard
          title={YOUTUBE_VIDEOS.setup.title}
          description={YOUTUBE_VIDEOS.setup.description}
          videos={[
            { title: "Setup Number", videoId: YOUTUBE_VIDEOS.setup.videoId },
            { title: "Send Broadcast", videoId: YOUTUBE_VIDEOS.broadcast.videoId },
            // { title: "Create Template", videoId: YOUTUBE_VIDEOS.templates.videoId },
          ]}
        />
      </div>
    </div>
  );
}