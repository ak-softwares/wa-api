import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Youtube } from "lucide-react";
import { YOUTUBE_CHANNEL } from "@/utiles/constans/youtubeHelp";

type VideoItem = {
  title: string;
  videoId: string;
};

interface YouTubeHelpCardProps {
  title: string;
  description?: string;

  // 👇 accept single OR multiple
  videoId?: string;
  videos?: VideoItem[];
}

export function YouTubeHelpCard({
  title,
  description,
  videoId,
  videos,
}: YouTubeHelpCardProps) {
  const videoList =
    videos && videos.length > 0
      ? videos
      : videoId
      ? [{ title, videoId }]
      : [];

  if (!videoList.length) return null;

  const firstVideo = videoList[0];

  return (
    <Card className="rounded-2xl shadow-sm">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            {title}
          </CardTitle>

          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>

        {/* 👇 moved here */}
        <Button asChild variant="outline" size="sm">
          <Link
            href={YOUTUBE_CHANNEL.url}
            target="_blank"
          >
            Watch on YouTube
            <ExternalLink className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>

      {/* Content */}
      <CardContent>
        <div
          className={`
            grid gap-4
            ${videoList.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}
          `}
        >
          {videoList.map((video) => (
            <div
              key={video.videoId}
              className="overflow-hidden rounded-xl border bg-black"
            >
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface Props {
  videoId?: string;
}

export function YouTubeHelpButton({
  videoId
}: Props) {

  return (
    <Button asChild variant="outline" size="sm">
      <Link
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
      >
        Watch on YouTube
        <ExternalLink className="ml-1 h-4 w-4" />
      </Link>
    </Button>
  );
}