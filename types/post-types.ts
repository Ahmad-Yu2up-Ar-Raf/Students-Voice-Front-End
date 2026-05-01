// ✅ Import Media dari file-picker — single source of truth
import { Media } from '@/components/ui/fragments/shadcn-ui/file-picker';

export interface PostsResponse {
  data: Data;
  success: boolean; // FIX: was 'succes' (typo)
  message: string;
}

export interface Data {
  current_page: number;
  data: DataPost[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Link[];
  next_page_url: string;
  path: string;
  per_page: number;
  prev_page_url: null;
  to: number;
  total: number;
}

export interface Post {
  id?: number; // FIX: diperlukan untuk edit mode di SavePost
  media?: Media[]; // Media hanya berisi uri + file metadata, TANPA base64
  caption?: string;
  visibility?: string;
  tag_category?: string;
  tag_location?: string;
  tagline?: string;
}

export interface DataPost extends Post {
  likes_count: number;
  reposts_count: number;
  created_at?: Date;
  user_id?: number;
  updated_at?: Date;
}

export interface Link {
  url: null | string;
  label: string;
  page: number | null;
  active: boolean;
}

// Re-export Media supaya komponen lain bisa import dari sini juga
export type { Media };
