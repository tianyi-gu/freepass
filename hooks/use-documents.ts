import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type DocumentCategory =
  | 'ID'
  | 'Certification'
  | 'Medical'
  | 'Legal'
  | 'Employment'
  | 'Housing'
  | 'Other';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'ID',
  'Certification',
  'Medical',
  'Legal',
  'Employment',
  'Housing',
  'Other',
];

export const CATEGORY_ICONS: Record<DocumentCategory, string> = {
  ID: 'person.text.rectangle',
  Certification: 'checkmark.seal.fill',
  Medical: 'heart.fill',
  Legal: 'doc.text.fill',
  Employment: 'building.2.fill',
  Housing: 'house.fill',
  Other: 'doc.fill',
};

export const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  ID: '#3498DB',
  Certification: '#2E8540',
  Medical: '#E91E63',
  Legal: '#9B59B6',
  Employment: '#F39C12',
  Housing: '#E74C3C',
  Other: '#95A5A6',
};

export interface UserDocument {
  id: string;
  user_id: string;
  name: string;
  category: DocumentCategory;
  storage_path: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

const BUCKET = 'documents';

export function useDocuments(userId: string | null) {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setDocuments([]);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setDocuments(data as UserDocument[]);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const uploadDocument = useCallback(
    async (args: {
      uri: string;
      name: string;
      category: DocumentCategory;
      notes?: string;
    }) => {
      if (!userId) throw new Error('Not signed in');
      setIsUploading(true);
      try {
        // Read the file
        const response = await fetch(args.uri);
        const arrayBuffer = await response.arrayBuffer();

        // Infer extension
        const ext = args.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const storagePath = `${userId}/${Date.now()}.${ext}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, arrayBuffer, { contentType, upsert: false });
        if (uploadError) throw uploadError;

        // Save row in user_documents
        const { error: insertError } = await supabase.from('user_documents').insert({
          user_id: userId,
          name: args.name,
          category: args.category,
          storage_path: storagePath,
          notes: args.notes || null,
        });
        if (insertError) {
          // Roll back the uploaded file if metadata insert fails
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw insertError;
        }

        await load();
      } finally {
        setIsUploading(false);
      }
    },
    [userId, load],
  );

  const deleteDocument = useCallback(
    async (doc: UserDocument) => {
      await supabase.storage.from(BUCKET).remove([doc.storage_path]);
      await supabase.from('user_documents').delete().eq('id', doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    },
    [],
  );

  const updateDocument = useCallback(
    async (
      id: string,
      updates: { name?: string; category?: DocumentCategory; notes?: string | null },
    ) => {
      const { error } = await supabase
        .from('user_documents')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updates } as UserDocument : d)),
      );
    },
    [],
  );

  const getSignedUrl = useCallback(async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 60 * 60); // 1 hour
    if (error || !data) return null;
    return data.signedUrl;
  }, []);

  return {
    documents,
    isLoading,
    isUploading,
    reload: load,
    uploadDocument,
    deleteDocument,
    updateDocument,
    getSignedUrl,
  };
}

// Helpers for picking images
export async function pickFromLibrary(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}
