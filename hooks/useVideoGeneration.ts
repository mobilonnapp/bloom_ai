import { useState, useCallback, useRef } from 'react';
import { VideoJob } from '../types';
import { startFaceSwap, pollUntilDone, formatApiError } from '../services/vmodel';
import { upsertVideoJob } from '../services/storage';

export type GenerationState = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

interface UseVideoGenerationOptions {
  onComplete?: (job: VideoJob) => void;
  onError?: (message: string) => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const [state, setState] = useState<GenerationState>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentJob, setCurrentJob] = useState<VideoJob | null>(null);
  const abortRef = useRef(false);

  const generate = useCallback(
    async (params: {
      templateId: string;
      templateTitle: string;
      templateThumbnail: string;
      templateVideoUrl: string;
      face1Uri: string;
      face2Uri: string;
    }) => {
      abortRef.current = false;
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const baseJob: VideoJob = {
        id: jobId,
        templateId: params.templateId,
        templateTitle: params.templateTitle,
        templateThumbnail: params.templateThumbnail,
        status: 'pending',
        progress: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setCurrentJob(baseJob);
      setState('uploading');
      setProgress(5);
      setStatusMessage('Uploading photos...');
      await upsertVideoJob(baseJob);

      try {
        // Step 1: Start face swap
        const taskId = await startFaceSwap({
          templateVideoUrl: params.templateVideoUrl,
          face1Uri: params.face1Uri,
          face2Uri: params.face2Uri,
        });

        if (abortRef.current) return;

        setState('processing');
        setStatusMessage('AI is generating your video...');

        const processingJob: VideoJob = {
          ...baseJob,
          status: 'processing',
          progress: 10,
          updatedAt: Date.now(),
        };
        setCurrentJob(processingJob);
        await upsertVideoJob(processingJob);

        // Step 2: Poll until done
        const result = await pollUntilDone(
          taskId,
          (p) => {
            if (!abortRef.current) {
              const mapped = 10 + p * 0.9; // scale 0-100 → 10-100
              setProgress(Math.round(mapped));
              if (p < 30) setStatusMessage('Processing face swap...');
              else if (p < 60) setStatusMessage('Rendering video...');
              else if (p < 90) setStatusMessage('Applying finishing touches...');
              else setStatusMessage('Almost there...');
            }
          },
          { maxAttempts: 60, intervalMs: 3000 }
        );

        if (abortRef.current) return;

        // Step 3: Complete
        const doneJob: VideoJob = {
          ...baseJob,
          status: 'completed',
          progress: 100,
          resultUrl: result.resultUrl,
          updatedAt: Date.now(),
        };

        setCurrentJob(doneJob);
        setProgress(100);
        setStatusMessage('Video ready! 🎉');
        setState('done');
        await upsertVideoJob(doneJob);
        options.onComplete?.(doneJob);
      } catch (err) {
        if (abortRef.current) return;

        const message = formatApiError(err);
        const failedJob: VideoJob = {
          ...baseJob,
          status: 'failed',
          error: message,
          updatedAt: Date.now(),
        };

        setCurrentJob(failedJob);
        setState('error');
        setStatusMessage(message);
        await upsertVideoJob(failedJob);
        options.onError?.(message);
      }
    },
    [options]
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
    setState('idle');
    setProgress(0);
    setStatusMessage('');
    setCurrentJob(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current = false;
    setState('idle');
    setProgress(0);
    setStatusMessage('');
    setCurrentJob(null);
  }, []);

  return { state, progress, statusMessage, currentJob, generate, cancel, reset };
}
