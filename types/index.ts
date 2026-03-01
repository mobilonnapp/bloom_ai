export interface Template {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  /** Remote CDN URL — used by VModel API. Set '' until uploaded to CDN. */
  videoUrl: string;
  /** Bundled local asset via require(). Used for in-app preview. */
  localVideo?: number;
  duration: number; // seconds
  credits: number;
  hasSound: boolean;
  characterCount: number;
  characters?: Character[];
  isPopular?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

export interface Character {
  id: string;
  thumbnailUrl: string;
  name?: string;
}

export interface FacePhoto {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  mimeType?: string;
}

export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoJob {
  id: string;
  templateId: string;
  templateTitle: string;
  templateThumbnail: string;
  status: VideoJobStatus;
  progress: number;
  resultUrl?: string;
  localResultPath?: string;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

export interface UserCredits {
  balance: number;
  plan: 'free' | 'pro' | 'unlimited';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  credits: number;
  priceDisplay: string;
  period: string;
  trialDays?: number;
  features: string[];
}
