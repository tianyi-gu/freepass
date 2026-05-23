import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface Resource {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  last_verified: string | null;
  category?: { name: string; icon: string };
}

export interface ResourceCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export function useResources(categoryId?: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('resources')
      .select('*, category:resource_categories(name, icon)')
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    let { data, error: err } = await query;

    if (err) {
      // Fallback: fetch resources without the category join
      let fallback = supabase.from('resources').select('*').order('name');
      if (categoryId) fallback = fallback.eq('category_id', categoryId);
      const result = await fallback;
      data = result.data;
      err = result.error;
    }

    if (err) {
      setError(err.message);
    } else {
      setResources((data as Resource[]) ?? []);
    }
    setLoading(false);
  }, [categoryId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { resources, loading, error, refetch: fetch };
}

export function useResource(id: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      let { data, error: err } = await supabase
        .from('resources')
        .select('*, category:resource_categories(name, icon)')
        .eq('id', id)
        .single();

      if (err) {
        // Fallback without the category join
        const result = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .single();
        data = result.data;
        if (result.error) setError(result.error.message);
      }

      setResource(data);
      setLoading(false);
    }
    load();
  }, [id]);

  return { resource, loading, error };
}

export function useResourceCategories() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('resource_categories')
      .select('*')
      .order('sort_order')
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading, error };
}
