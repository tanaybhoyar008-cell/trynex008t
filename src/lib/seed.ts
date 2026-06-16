import collegeDiaries from "@/assets/seed-college-diaries.jpg";
import campusLove from "@/assets/seed-campus-love.jpg";
import firstLove from "@/assets/seed-first-love.jpg";
import brokenStrong from "@/assets/seed-broken-strong.jpg";
import hostelNights from "@/assets/seed-hostel-nights.jpg";
import roadTrip from "@/assets/seed-road-trip.jpg";
import midnightRun from "@/assets/seed-midnight-run.jpg";
import chaiTalks from "@/assets/seed-chai-talks.jpg";

export type SeedVideo = {
  id: string;
  title: string;
  series_title?: string;
  episode_number?: number;
  type: "video" | "series" | "short" | "story";
  thumbnail_url: string;
  video_url: string;
  description: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  duration_seconds: number;
  creator: { username: string; display_name: string; followers: number; avatar_hue: number };
};

// Public sample MP4 used for the player demo.
const SAMPLE_MP4 = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const SEED_VIDEOS: SeedVideo[] = [
  {
    id: "seed-college-diaries",
    title: "College Diaries — New Episode Friday",
    series_title: "College Diaries",
    episode_number: 8,
    type: "series",
    thumbnail_url: collegeDiaries,
    video_url: SAMPLE_MP4,
    description: "Six friends, one campus, a thousand stories. New episode drops every Friday.",
    tags: ["#college", "#friendship", "#drama"],
    views: 1_280_000,
    likes: 92_400,
    comments: 8_120,
    shares: 4_600,
    created_at: new Date(Date.now() - 86_400_000 * 2).toISOString(),
    duration_seconds: 1480,
    creator: { username: "trynexoriginals", display_name: "Trynex Originals", followers: 125_000, avatar_hue: 280 },
  },
  {
    id: "seed-campus-love",
    title: "Campus Love — Episode 3",
    series_title: "Campus Love",
    episode_number: 3,
    type: "series",
    thumbnail_url: campusLove,
    video_url: SAMPLE_MP4,
    description: "Aman and Riya bump into each other after the monsoon. Episode 3 of the slow-burn romance.",
    tags: ["#romance", "#college", "#drama"],
    views: 125_000,
    likes: 22_500,
    comments: 2_120,
    shares: 1_200,
    created_at: new Date(Date.now() - 86_400_000 * 3).toISOString(),
    duration_seconds: 1470,
    creator: { username: "trynexoriginals", display_name: "Trynex Originals", followers: 125_000, avatar_hue: 280 },
  },
  {
    id: "seed-first-love",
    title: "First Love — EP 3",
    series_title: "First Love",
    episode_number: 3,
    type: "series",
    thumbnail_url: firstLove,
    video_url: SAMPLE_MP4,
    description: "Library glances, borrowed notes, accidental brushes. The story of every first crush.",
    tags: ["#firstlove", "#romance"],
    views: 540_000,
    likes: 40_200,
    comments: 3_900,
    shares: 2_100,
    created_at: new Date(Date.now() - 86_400_000 * 4).toISOString(),
    duration_seconds: 1280,
    creator: { username: "sunrise.studios", display_name: "Sunrise Studios", followers: 88_400, avatar_hue: 30 },
  },
  {
    id: "seed-broken-strong",
    title: "Broken But Strong",
    series_title: "Broken But Strong",
    episode_number: 1,
    type: "series",
    thumbnail_url: brokenStrong,
    video_url: SAMPLE_MP4,
    description: "She lost everything in a single night. What she rebuilt is a story you won't forget.",
    tags: ["#drama", "#motivation"],
    views: 760_000,
    likes: 60_100,
    comments: 5_400,
    shares: 3_300,
    created_at: new Date(Date.now() - 86_400_000 * 5).toISOString(),
    duration_seconds: 1620,
    creator: { username: "redframe", display_name: "Redframe Pictures", followers: 210_000, avatar_hue: 0 },
  },
  {
    id: "seed-hostel-nights",
    title: "Hostel Nights — Season 1",
    series_title: "Hostel Nights",
    episode_number: 1,
    type: "series",
    thumbnail_url: hostelNights,
    video_url: SAMPLE_MP4,
    description: "Four girls, one tiny dorm, every secret you ever heard about hostel life.",
    tags: ["#hostel", "#friends", "#comedy"],
    views: 412_000,
    likes: 34_700,
    comments: 2_980,
    shares: 1_600,
    created_at: new Date(Date.now() - 86_400_000 * 7).toISOString(),
    duration_seconds: 1390,
    creator: { username: "nightlight", display_name: "Nightlight Studio", followers: 56_000, avatar_hue: 50 },
  },
  {
    id: "seed-road-trip",
    title: "Road Trip Diaries",
    type: "short",
    thumbnail_url: roadTrip,
    video_url: SAMPLE_MP4,
    description: "Two friends, one motorbike, the open Konkan coast. A short film about getting lost on purpose.",
    tags: ["#shortfilm", "#travel"],
    views: 92_000,
    likes: 8_800,
    comments: 540,
    shares: 320,
    created_at: new Date(Date.now() - 86_400_000 * 10).toISOString(),
    duration_seconds: 720,
    creator: { username: "alok.diaries", display_name: "Alok Mehta", followers: 12_400, avatar_hue: 200 },
  },
  {
    id: "seed-midnight-run",
    title: "Midnight Run",
    type: "short",
    thumbnail_url: midnightRun,
    video_url: SAMPLE_MP4,
    description: "He has 8 minutes to deliver the package. The alleys of Mumbai have other plans.",
    tags: ["#thriller", "#shortfilm"],
    views: 168_000,
    likes: 15_300,
    comments: 870,
    shares: 610,
    created_at: new Date(Date.now() - 86_400_000 * 12).toISOString(),
    duration_seconds: 540,
    creator: { username: "neonframe", display_name: "Neon Frame", followers: 33_000, avatar_hue: 320 },
  },
  {
    id: "seed-chai-talks",
    title: "Chai Talks — Rooftop Edition",
    type: "video",
    thumbnail_url: chaiTalks,
    video_url: SAMPLE_MP4,
    description: "Honest conversations over masala chai at sunset. This week: chasing what you actually want.",
    tags: ["#chai", "#talks", "#vibes"],
    views: 48_000,
    likes: 5_200,
    comments: 410,
    shares: 180,
    created_at: new Date(Date.now() - 86_400_000 * 1).toISOString(),
    duration_seconds: 920,
    creator: { username: "rooftop.collective", display_name: "Rooftop Collective", followers: 9_100, avatar_hue: 340 },
  },
];

export function getSeedVideo(id: string): SeedVideo | undefined {
  return SEED_VIDEOS.find((v) => v.id === id);
}
