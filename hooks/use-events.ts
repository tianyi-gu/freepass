import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export interface AppEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  address: string | null;
  event_date: string;
  end_date: string | null;
  instructor: string | null;
}

export function useEvents() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date')
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setEvents(data ?? []);
        setLoading(false);
      });
  }, []);

  return { events, loading, error };
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEvent(null);
      setError('Missing event id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setEvent(null);
    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  return { event, loading, error };
}
