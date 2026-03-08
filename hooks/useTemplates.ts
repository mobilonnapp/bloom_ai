import { useState, useEffect, useCallback } from 'react';
import { Template } from '../types';
import { fetchTemplates, fetchCategories } from '../services/api';
// Fallback to local constants when the API server is not running
import { MOCK_TEMPLATES, TEMPLATE_CATEGORIES } from '../constants/templates';

interface UseTemplatesResult {
  templates:  Template[];
  categories: string[];
  loading:    boolean;
  error:      string | null;
  refresh:    () => void;
}

export function useTemplates(): UseTemplatesResult {
  const [templates,  setTemplates]  = useState<Template[]>(MOCK_TEMPLATES);
  const [categories, setCategories] = useState<string[]>(TEMPLATE_CATEGORIES);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tmpl, cats] = await Promise.all([fetchTemplates(), fetchCategories()]);
      setTemplates(tmpl);
      setCategories(cats);
    } catch (e: any) {
      // API unreachable — keep local fallback data, just surface the warning
      setError('Sunucuya bağlanılamadı, yerel veriler kullanılıyor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { templates, categories, loading, error, refresh: load };
}
