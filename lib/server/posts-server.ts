import { Post, PostsResponse } from '@/types/post-types';
import { DataPost } from '../../types/post-types';

const BASE_API = process.env.EXPO_PUBLIC_API_URL ?? `http://192.168.100.11:8000/api`;

export async function FetchAllPosts(): Promise<DataPost[]> {
  try {
    const res = await fetch(BASE_API);
    if (!res.ok) {
      throw new Error(`Failed to fetch post data: HTTP ${res.status}`);
    }
    const json = (await res.json()) as PostsResponse;
    if (!json) {
      throw new Error(`Unexpected JSON error response`);
    }
    const posts = json.data.data;
    const mapped = posts.map((post) => ({
      ...post,
      created_at: typeof post.created_at === 'string' ? parseInt(post.created_at) : post.created_at,
      updated_at: typeof post.updated_at === 'string' ? parseInt(post.updated_at) : post.updated_at,
    }));

    return mapped as DataPost[];
  } catch (error) {
    console.log(`Error while fetching data: ${error}`);
    return [];
  }
}

export interface UpdatePostResult {
  ok: boolean;
  status: number;
  data: any;
  message?: string;
}

export async function UpdatePost(Data: Post & { id: number }): Promise<UpdatePostResult> {
  try {
    const caption = Data.caption;
    if (!caption?.trim()) {
      throw new Error(`Caption is required`);
    }

    const postData = {
      ...Data,
      caption: caption.trim(),
    };

    const res = await fetch(`${BASE_API}/posts/${Data.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    const data = await res.json();

    return {
      ok: res.ok,
      status: res.status,
      data,
      message: data?.message,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

interface FetchPostResponse {
  data: Post;
  succes: boolean;
  message: string;
}

export async function FetchPost(id: number): Promise<FetchPostResponse> {
  try {
    const res = await fetch(`${BASE_API}/posts/${id}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch id post ${id}`);
    }

    const data = (await res.json()) as FetchPostResponse;
    if (!data) {
      throw new Error(`Unexpected json response`);
    }

    return data;
  } catch (error) {
    console.log(`Error while fetching post data:`, error);
    throw error;
  }
}

export async function DeletePost(id: number): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${BASE_API}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await res.json();
    return { ok: res.ok, message: data?.message };
  } catch (error) {
    console.log(`Error while deleting post:`, error);
    throw error;
  }
}

export interface SavePostResult {
  ok: boolean;
  status: number;
  message: string;
  data?: any;
}

/**
 * Buat atau update post.
 * - create: POST /posts
 * - update: POST /posts/{id} dengan _method=PUT (method spoofing Laravel)
 */
export async function SavePost(postData: Post): Promise<SavePostResult> {
  const isEdit = !!postData.id;
  const url = isEdit ? `${BASE_API}/posts/${postData.id}` : `${BASE_API}/posts`;

  const formData = new FormData();

  // ─── Pisahkan file baru vs file existing ─────────────────────────────────
  const existingMedia: Array<{
    file_path: string;
    file: { name: string; size: number; type: string };
  }> = [];

  for (const mediaItem of postData.media ?? []) {
    const isRemoteFile =
      mediaItem.uri.startsWith('http://') || mediaItem.uri.startsWith('https://');

    if (isRemoteFile) {
      // File sudah ada di server — kirim file_path-nya saja
      existingMedia.push({
        file_path: extractStoragePath(mediaItem.uri),
        file: mediaItem.file,
      });
    } else {
      /**
       * File baru dari device — append sebagai binary.
       * React Native fetch akan membaca file dari disk secara streaming,
       * TIDAK loading ke JS heap — ini yang menghilangkan OOM/force close.
       */
      formData.append('media[]', {
        uri: mediaItem.uri,
        name: mediaItem.file.name,
        type: mediaItem.file.type,
      } as any);
    }
  }

  // Kirim daftar file lama sebagai JSON string
  if (existingMedia.length > 0) {
    formData.append('existing_media', JSON.stringify(existingMedia));
  }

  // ─── Field teks ───────────────────────────────────────────────────────────
  formData.append('caption', postData.caption ?? '');
  formData.append('tag_category', postData.tag_category ?? '');
  formData.append('tagline', postData.tagline ?? '');

  if (postData.visibility) formData.append('visibility', postData.visibility);
  if (postData.tag_location) formData.append('tag_location', postData.tag_location);

  // Method spoofing — Laravel membaca _method dari FormData body
  if (isEdit) formData.append('_method', 'PUT');

  // ─── Kirim request ────────────────────────────────────────────────────────
  const response = await fetch(url, {
    method: 'POST', // selalu POST; route override via _method
    headers: {
      Accept: 'application/json',
      // JANGAN set Content-Type manual — browser/RN set otomatis dengan boundary
    },
    body: formData,
  });

  let json: any = {};
  try {
    json = await response.json();
  } catch {
    // Response mungkin kosong pada error tertentu
  }

  return {
    ok: response.ok,
    status: response.status,
    message: json.message ?? (response.ok ? 'Success' : 'Request failed'),
    data: json.data,
  };
}

/**
 * Ekstrak storage path dari full URL.
 * Contoh:
 *   "http://localhost:8000/storage/Post/abc.jpg" → "Post/abc.jpg"
 */
function extractStoragePath(url: string): string {
  const marker = '/storage/';
  const idx = url.indexOf(marker);
  return idx !== -1 ? url.substring(idx + marker.length) : url;
}
