import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useUser } from '@/contexts/user-context';
import { Resource } from './use-resources';

export function useSavedResources() {
  const { user } = useUser();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user || user.isGuest) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('saved_resources')
      .select('resource_id, resource:resources(*, category:resource_categories(name, icon))')
      .eq('user_id', user.id);

    if (data) {
      setSavedIds(new Set(data.map((d) => d.resource_id)));
      setSavedResources(data.map((d) => d.resource as unknown as Resource).filter(Boolean));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleSave = useCallback(async (resourceId: string) => {
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please create an account or log in to save resources.');
      return;
    }

    if (savedIds.has(resourceId)) {
      await supabase
        .from('saved_resources')
        .delete()
        .eq('user_id', user.id)
        .eq('resource_id', resourceId);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
      setSavedResources((prev) => prev.filter((r) => r.id !== resourceId));
    } else {
      await supabase
        .from('saved_resources')
        .insert({ user_id: user.id, resource_id: resourceId });
      setSavedIds((prev) => new Set(prev).add(resourceId));
      // Refetch to get the full resource data
      await fetch();
    }
  }, [user, savedIds, fetch]);

  const isSaved = useCallback((resourceId: string) => savedIds.has(resourceId), [savedIds]);

  return { savedResources, loading, toggleSave, isSaved, refetch: fetch };
}
