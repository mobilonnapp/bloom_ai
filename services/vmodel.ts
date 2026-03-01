/**
 * VModel.ai Face Swap API Service
 * Docs: https://vmodel.ai/docs/api/
 *
 * Flow:
 *  1. uploadFaceImage()  → POST tmpfiles.org/api/v1/upload  → hosted URL
 *  2. startFaceSwap()    → POST /api/tasks/v1/create        → result.task_id
 *  3. pollUntilDone()    → GET  /api/tasks/v1/get/{id}      → result.{status,output}
 *
 * VModel only accepts HTTP URLs (not base64). Face images are uploaded to
 * tmpfiles.org (no API key needed), then the URL is passed to VModel.
 */

import axios, { AxiosError } from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────
const VMODEL_BASE_URL = 'https://api.vmodel.ai';
const API_KEY         = process.env.EXPO_PUBLIC_VMODEL_API_KEY ?? '';

// Video Face Swap Pro model version (confirmed from official curl example).
const MODEL_VERSION = '537e83f7ed84751dc56aa80fb2391b07696c85a49967c72c64f002a0ca2bb224';

const api = axios.create({
  baseURL: VMODEL_BASE_URL,
  timeout: 90_000,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FaceSwapRequest {
  templateVideoUrl: string;
  face1Uri: string;
  face2Uri: string;
}

export interface VModelJob {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  errorMessage?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/**
 * Upload a local face image to catbox.moe and return the hosted HTTPS URL.
 * No API key needed. Files are stored permanently and served as direct downloads.
 * catbox.moe is widely accessible from cloud servers (VModel can download from it).
 */
async function uploadFaceImage(localUri: string): Promise<string> {
  const mimeType = localUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const fileName = localUri.toLowerCase().endsWith('.png') ? 'face.png' : 'face.jpg';

  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', { uri: localUri, type: mimeType, name: fileName } as any);

  // catbox.moe returns plain-text URL, e.g. "https://files.catbox.moe/abc123.jpg"
  const response = await axios.post<string>(
    'https://catbox.moe/user/api.php',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    }
  );

  const url = typeof response.data === 'string' ? response.data.trim() : '';
  if (!url.startsWith('https://files.catbox.moe/')) {
    throw new Error(`Fotoğraf yükleme başarısız. Yanıt: ${url || JSON.stringify(response.data)}`);
  }
  return url;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start a face-swap job and return the task id.
 * face1Uri = local photo URI, templateVideoUrl = CDN video URL.
 */
export async function startFaceSwap(req: FaceSwapRequest): Promise<string> {
  if (!req.templateVideoUrl) {
    throw new Error('Template video URL boş. constants/templates.ts içinde videoUrl ayarla.');
  }

  // 1. Upload face photo → get hosted URL
  const faceUrl = await uploadFaceImage(req.face1Uri);

  // 2. Create face-swap task on VModel
  // Documented response: { code:200, result:{ task_id:"...", task_cost:N }, message:{en:"..."} }
  const response = await api.post('/api/tasks/v1/create', {
    version: MODEL_VERSION,
    input: {
      // "target" = face image URL, "source" = template video URL
      target:                 faceUrl,
      source:                 req.templateVideoUrl,
      disable_safety_checker: true,
    },
  });

  const d = response.data as any;

  const taskId: string | undefined =
    d?.result?.task_id  ??
    d?.result?.taskId   ??
    d?.task_id          ??
    d?.taskId           ??
    d?.id               ??
    d?.data?.task_id    ??
    response.headers['x-task-id'] ??
    response.headers['task-id']   ??
    response.headers['location']?.split('/').pop();

  if (!taskId) {
    throw new Error(
      `API task ID döndürmedi.\n` +
      `Body: ${JSON.stringify(response.data)}`
    );
  }
  return taskId;
}

/**
 * Get the current status of a face-swap task.
 * Endpoint: GET /api/tasks/v1/get/{task_id}
 */
export async function getJobStatus(taskId: string): Promise<VModelJob> {
  const { data } = await api.get(`/api/tasks/v1/get/${taskId}`);

  const result = (data as any)?.result ?? data;

  const statusMap: Record<string, VModelJob['status']> = {
    starting:   'processing',
    processing: 'processing',
    succeeded:  'completed',
    failed:     'failed',
    canceled:   'failed',
  };

  const rawOutput = result?.output;
  const resultUrl = Array.isArray(rawOutput)
    ? rawOutput[0]
    : (typeof rawOutput === 'string' ? rawOutput : undefined);

  // Extract error message from any field VModel might use
  const errorMessage: string | undefined =
    extractMsg(result?.error) ??
    extractMsg(result?.message) ??
    extractMsg(result?.logs) ??
    (result?.status === 'failed' ? `Task failed (status=${result?.status})` : undefined);

  return {
    taskId:    result?.task_id ?? taskId,
    status:    statusMap[result?.status] ?? 'processing',
    progress:  0,
    resultUrl: resultUrl || undefined,
    errorMessage,
  };
}

/**
 * Poll every intervalMs until completed / failed / timeout.
 */
export async function pollUntilDone(
  taskId: string,
  onProgress: (p: number) => void,
  opts: { maxAttempts?: number; intervalMs?: number } = {}
): Promise<VModelJob> {
  const { maxAttempts = 60, intervalMs = 3_000 } = opts;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let job: VModelJob;

    try {
      job = await getJobStatus(taskId);
    } catch (err) {
      if (attempt <= 3) { await sleep(intervalMs * 2); continue; }
      throw err;
    }

    // VModel doesn't return progress — estimate linearly
    const p = Math.min(95, Math.round((attempt / maxAttempts) * 100));
    onProgress(p);

    if (job.status === 'completed') { onProgress(100); return job; }
    if (job.status === 'failed')    { throw new Error(job.errorMessage ?? 'Face swap başarısız.'); }

    await sleep(intervalMs);
  }

  throw new Error('İşlem 3 dakikada tamamlanamadı. Lütfen tekrar dene.');
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Safely extract a string from a value that may be a string or nested object. */
function extractMsg(v: unknown): string | undefined {
  if (typeof v === 'string' && v.length > 0) return v;
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return extractMsg(o.message) ?? extractMsg(o.detail) ?? extractMsg(o.error);
  }
  return undefined;
}

export function formatApiError(err: unknown): string {
  if (err instanceof AxiosError) {
    const body   = err.response?.data as Record<string, unknown> | undefined;
    const result = body?.result as Record<string, unknown> | undefined;

    const msg =
      extractMsg(result?.message) ??
      extractMsg(result?.error)   ??
      extractMsg(body?.message)   ??
      extractMsg(body?.error)     ??
      extractMsg(body?.detail);

    if (msg) return msg;

    switch (err.response?.status) {
      case 401: return 'Geçersiz API anahtarı. .env dosyasındaki EXPO_PUBLIC_VMODEL_API_KEY değerini kontrol et.';
      case 402: return 'Yetersiz VModel kredisi. Hesabını şarj et.';
      case 413: return 'Fotoğraf çok büyük. 5 MB altında bir fotoğraf kullan.';
      case 422: return 'Geçersiz istek. Net yüz fotoğrafı kullan.';
      case 429: return 'Çok fazla istek. Biraz bekle ve tekrar dene.';
      case 503: return 'VModel servisi meşgul. Biraz sonra tekrar dene.';
    }
    if (err.code === 'ECONNABORTED') return 'İstek zaman aşımına uğradı. İnternet bağlantını kontrol et.';
  }
  if (err instanceof Error) return err.message;
  return 'Beklenmeyen bir hata oluştu.';
}

export function isApiKeyConfigured(): boolean {
  return API_KEY.length > 0;
}
