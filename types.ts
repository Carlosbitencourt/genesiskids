
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  credits: number;
  createdAt: number;
}

export interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: string;
  icon: 'zap' | 'star' | 'shield' | 'coins';
  color: 'blue' | 'amber' | 'emerald' | 'purple';
  popular?: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export interface StoryScene {
  id: string;
  image: string;
  description: string;
  prompt: string;
}

export interface Story {
  id: string;
  title: string;
  scenes: StoryScene[];
  createdAt: number;
}

export type AppTab = 'single' | 'story' | 'poster' | 'admin' | 'shop' | 'profile';

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  currentImage: GeneratedImage | null;
}
