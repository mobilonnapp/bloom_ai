import axios from 'axios';
import { Template } from '../types';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

// Local-only video assets (bundled in the app binary)
const LOCAL_VIDEOS: Record<string, number> = {
  'baby_banana.mp4': require('../videos/baby_banana.mp4'),
};

function mapTemplate(raw: any): Template {
  return {
    id:             raw.id,
    title:          raw.title,
    category:       raw.category,
    thumbnailUrl:   raw.thumbnailUrl  || '',
    videoUrl:       raw.videoUrl      || '',
    localVideo:     raw.localVideo ? LOCAL_VIDEOS[raw.localVideo] : undefined,
    duration:       raw.duration      || 0,
    credits:        raw.credits       || 500,
    hasSound:       Boolean(raw.hasSound),
    characterCount: raw.characterCount || 1,
    isFeatured:     Boolean(raw.isFeatured),
    isPopular:      Boolean(raw.isPopular),
    isTrending:     Boolean(raw.isTrending),
    tags:           Array.isArray(raw.tags) ? raw.tags : [],
  };
}

export async function fetchTemplates(category?: string): Promise<Template[]> {
  const params = category ? { category } : {};
  const { data } = await axios.get(`${BASE_URL}/api/templates`, { params, timeout: 8000 });
  return data.data.map(mapTemplate);
}

export async function fetchCategories(): Promise<string[]> {
  const { data } = await axios.get(`${BASE_URL}/api/categories`, { timeout: 8000 });
  return (data.data as any[]).map((c: any) => c.name);
}

export async function fetchTemplateById(id: string): Promise<Template | null> {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/templates/${id}`, { timeout: 8000 });
    return mapTemplate(data.data);
  } catch {
    return null;
  }
}
