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

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setResources(data ?? []);
    }
    setLoading(false);
  }, [categoryId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { resources, loading, error, refetch: fetch };
}

export function useResource(id: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('resources')
      .select('*, category:resource_categories(name, icon)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setResource(data);
        setLoading(false);
      });
  }, [id]);

  return { resource, loading };
}

export function useResourceCategories() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('resource_categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}
