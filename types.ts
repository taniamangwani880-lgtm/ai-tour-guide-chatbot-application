
export type Role = 'user' | 'assistant';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  groundingLinks?: GroundingLink[];
}

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface UserPreferences {
  budget: 'budget' | 'mid-range' | 'luxury';
  travelStyle: 'solo' | 'couple' | 'family' | 'group';
  interests: string[];
}

export interface LocationState {
  lat: number | null;
  lng: number | null;
  address: string;
  isAutoDetected: boolean;
}

export interface SavedGuide {
  id: string;
  title: string;
  content: string;
  date: string;
}
