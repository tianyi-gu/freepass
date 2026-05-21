import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  pickFromLibrary,
  takePhoto,
  type UserDocument,
  useDocuments,
} from '@/hooks/use-documents';

export default function DocumentsScreen() {
  const { user } = useUser();
  const userId = user && !user.isGuest ? user.id : null;
  const {
    documents,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
    updateDocument,
    getSignedUrl,
  } = useDocuments(userId);

  const [uploadModal, setUploadModal] = useState(false);
  const [pickerModal, setPickerModal] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Other');
  const [docNotes, setDocNotes] = useState('');
  const [viewerDoc, setViewerDoc] = useState<UserDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<UserDocument | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handlePickFromCamera = useCallback(async () => {
    setPickerModal(false);
    const uri = await takePhoto();
    if (!uri) {
      Alert.alert('Camera unavailable', 'We could not access the camera. Check permissions in Settings.');
      return;
    }
    setPendingUri(uri);
    setUploadModal(true);
  }, []);

  const handlePickFromLibrary = useCallback(async () => {
    setPickerModal(false);
    const uri = await pickFromLibrary();
    if (!uri) {
      Alert.alert('Photo library unavailable', 'We could not access your photos. Check permissions in Settings.');
      return;
    }
    setPendingUri(uri);
    setUploadModal(true);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!pendingUri || !docName.trim()) {
      Alert.alert('Missing name', 'Please give this document a name.');
      return;
    }
    try {
      await uploadDocument({
        uri: pendingUri,
        name: docName.trim(),
        category: docCategory,
        notes: docNotes.trim() || undefined,
      });
      setPendingUri(null);
      setDocName('');
      setDocCategory('Other');
      setDocNotes('');
      setUploadModal(false);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.message ?? 'Please try again.');
    }
  }, [pendingUri, docName, docCategory, docNotes, uploadDocument]);

  const handleStartEdit = useCallback((doc: UserDocument) => {
    setEditingDoc(doc);
    setDocName(doc.name);
    setDocCategory(doc.category as DocumentCategory);
    setDocNotes(doc.notes ?? '');
    setViewerDoc(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingDoc) return;
    if (!docName.trim()) {
      Alert.alert('Missing name', 'Please give this document a name.');
      return;
    }
    setIsSavingEdit(true);
    try {
      await updateDocument(editingDoc.id, {
        name: docName.trim(),
        category: docCategory,
        notes: docNotes.trim() || null,
      });
      setEditingDoc(null);
      setDocName('');
      setDocCategory('Other');
      setDocNotes('');
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setIsSavingEdit(false);
    }
  }, [editingDoc, docName, docCategory, docNotes, updateDocument]);

  const handleDelete = useCallback(
    (doc: UserDocument) => {
      Alert.alert(
        'Delete document',
        `Permanently delete "${doc.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteDocument(doc);
                if (viewerDoc?.id === doc.id) setViewerDoc(null);
              } catch (err: any) {
                Alert.alert('Delete failed', err?.message ?? 'Please try again.');
              }
            },
          },
        ],
      );
    },
    [deleteDocument, viewerDoc],
  );

  // Prompt guests / logged-out users to sign up (after all hooks)
  if (!user || user.isGuest) {
    return (
      <View style={styles.container}>
        <FreepassHeader title="My Documents" showBack />
        <View style={styles.centerContent}>
          <IconSymbol name="doc.text.fill" size={64} color={FreepassColors.lightGray} />
          <Text style={styles.emptyTitle}>Sign in to store documents</Text>
          <Text style={styles.emptyBody}>
            Create a free account to securely save IDs, certifications, and other important
            documents. They&apos;ll stay private to you.
          </Text>
          <Pressable style={styles.signUpBtn} onPress={() => router.push('/signup')}>
            <Text style={styles.signUpBtnText}>CREATE AN ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FreepassHeader title="My Documents" showBack />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headline}>Keep what matters safe</Text>
        <Text style={styles.subhead}>
          Snap a photo of IDs, certifications, and key paperwork. Only you can see these.
        </Text>

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={FreepassColors.accent} />
            <Text style={styles.loadingText}>Loading your documents...</Text>
          </View>
        )}

        {!isLoading && documents.length === 0 && (
          <View style={styles.emptyCard}>
            <IconSymbol name="doc.text.fill" size={48} color={FreepassColors.lightGray} />
            <Text style={styles.emptyTitle}>No documents yet</Text>
            <Text style={styles.emptyBody}>
              Tap &quot;Add Document&quot; below to take a picture or choose one from your library.
            </Text>
          </View>
        )}

        {documents.map((doc) => (
          <DocumentRow
            key={doc.id}
            doc={doc}
            onOpen={() => setViewerDoc(doc)}
            onDelete={() => handleDelete(doc)}
            getSignedUrl={getSignedUrl}
          />
        ))}
      </ScrollView>

      {/* Add Document button */}
      <View style={styles.footer}>
        <Pressable
          style={styles.addButton}
          onPress={() => setPickerModal(true)}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <IconSymbol name="plus" size={20} color={FreepassColors.white} />
          <Text style={styles.addButtonText}>ADD DOCUMENT</Text>
        </Pressable>
      </View>

      {/* Picker modal (camera vs library) */}
      <Modal visible={pickerModal} animationType="slide" transparent>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerModal(false)}>
          <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add a document</Text>
            <Pressable style={styles.sheetButton} onPress={handlePickFromCamera}>
              <IconSymbol name="camera.fill" size={22} color={FreepassColors.primary} />
              <Text style={styles.sheetButtonText}>Take a picture</Text>
            </Pressable>
            <Pressable style={styles.sheetButton} onPress={handlePickFromLibrary}>
              <IconSymbol name="photo.fill" size={22} color={FreepassColors.primary} />
              <Text style={styles.sheetButtonText}>Choose from library</Text>
            </Pressable>
            <Pressable style={styles.sheetCancel} onPress={() => setPickerModal(false)}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Upload details modal */}
      <Modal visible={uploadModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.uploadSheet}
            contentContainerStyle={styles.uploadSheetContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.sheetTitle}>Save document</Text>
              <Pressable
                onPress={() => {
                  setUploadModal(false);
                  setPendingUri(null);
                }}
                hitSlop={8}>
                <IconSymbol name="xmark" size={20} color={FreepassColors.text} />
              </Pressable>
            </View>

            {pendingUri && <Image source={{ uri: pendingUri }} style={styles.previewImage} />}

            <Text style={styles.inputLabel}>Document name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Driver's License"
              value={docName}
              onChangeText={setDocName}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryPicker}>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    docCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                  onPress={() => setDocCategory(cat)}>
                  <IconSymbol
                    name={CATEGORY_ICONS[cat] as any}
                    size={14}
                    color={docCategory === cat ? FreepassColors.white : CATEGORY_COLORS[cat]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      docCategory === cat && styles.categoryChipTextActive,
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. Expires 2028"
              value={docNotes}
              onChangeText={setDocNotes}
              placeholderTextColor={FreepassColors.textSecondary}
              multiline
            />

            <Pressable
              style={[styles.saveBtn, isUploading && styles.saveBtnDisabled]}
              onPress={handleUpload}
              disabled={isUploading}>
              {isUploading ? (
                <ActivityIndicator color={FreepassColors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Document</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Viewer modal */}
      {viewerDoc && (
        <DocumentViewer
          doc={viewerDoc}
          getSignedUrl={getSignedUrl}
          onClose={() => setViewerDoc(null)}
          onEdit={() => handleStartEdit(viewerDoc)}
          onDelete={() => handleDelete(viewerDoc)}
        />
      )}

      {/* Edit modal */}
      <Modal visible={!!editingDoc} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.uploadSheet}
            contentContainerStyle={styles.uploadSheetContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.sheetTitle}>Edit document</Text>
              <Pressable onPress={() => setEditingDoc(null)} hitSlop={8}>
                <IconSymbol name="xmark" size={20} color={FreepassColors.text} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Document name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Driver's License"
              value={docName}
              onChangeText={setDocName}
              placeholderTextColor={FreepassColors.textSecondary}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryPicker}>
              {DOCUMENT_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    docCategory === cat && { backgroundColor: CATEGORY_COLORS[cat] },
                  ]}
                  onPress={() => setDocCategory(cat)}>
                  <IconSymbol
                    name={CATEGORY_ICONS[cat] as any}
                    size={14}
                    color={docCategory === cat ? FreepassColors.white : CATEGORY_COLORS[cat]}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      docCategory === cat && styles.categoryChipTextActive,
                    ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="e.g. Expires 2028"
              value={docNotes}
              onChangeText={setDocNotes}
              placeholderTextColor={FreepassColors.textSecondary}
              multiline
            />

            <Pressable
              style={[styles.saveBtn, isSavingEdit && styles.saveBtnDisabled]}
              onPress={handleSaveEdit}
              disabled={isSavingEdit}>
              {isSavingEdit ? (
                <ActivityIndicator color={FreepassColors.white} />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function DocumentRow({
  doc,
  onOpen,
  onDelete,
  getSignedUrl,
}: {
  doc: UserDocument;
  onOpen: () => void;
  onDelete: () => void;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSignedUrl(doc.storage_path).then((url) => {
      if (!cancelled) setThumbUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [doc.storage_path, getSignedUrl]);

  const dateStr = new Date(doc.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable style={styles.docRow} onPress={onOpen} onLongPress={onDelete}>
      <View style={styles.thumbContainer}>
        {thumbUrl ? (
          <Image source={{ uri: thumbUrl }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <ActivityIndicator size="small" color={FreepassColors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>
          {doc.name}
        </Text>
        <View style={styles.docMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: CATEGORY_COLORS[doc.category as DocumentCategory] },
            ]}>
            <Text style={styles.categoryBadgeText}>{doc.category}</Text>
          </View>
          <Text style={styles.docDate}>{dateStr}</Text>
        </View>
        {doc.notes && (
          <Text style={styles.docNotes} numberOfLines={1}>
            {doc.notes}
          </Text>
        )}
      </View>
      <IconSymbol name="chevron.right" size={18} color={FreepassColors.textSecondary} />
    </Pressable>
  );
}

function DocumentViewer({
  doc,
  getSignedUrl,
  onClose,
  onEdit,
  onDelete,
}: {
  doc: UserDocument;
  getSignedUrl: (path: string) => Promise<string | null>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSignedUrl(doc.storage_path).then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [doc.storage_path, getSignedUrl]);

  return (
    <Modal visible animationType="fade" transparent>
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <Pressable onPress={onClose} style={styles.viewerIconBtn} hitSlop={8}>
            <IconSymbol name="xmark" size={22} color={FreepassColors.white} />
          </Pressable>
          <Text style={styles.viewerTitle} numberOfLines={1}>
            {doc.name}
          </Text>
          <Pressable onPress={onEdit} style={styles.viewerIconBtn} hitSlop={8}>
            <IconSymbol name="pencil" size={20} color={FreepassColors.white} />
          </Pressable>
          <Pressable onPress={onDelete} style={styles.viewerIconBtn} hitSlop={8}>
            <IconSymbol name="trash.fill" size={20} color="#FF6B6B" />
          </Pressable>
        </View>
        <View style={styles.viewerBody}>
          {url ? (
            <Image source={{ uri: url }} style={styles.viewerImage} resizeMode="contain" />
          ) : (
            <ActivityIndicator color={FreepassColors.white} />
          )}
        </View>
        {(doc.notes || doc.category) && (
          <View style={styles.viewerFooter}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: CATEGORY_COLORS[doc.category as DocumentCategory] },
              ]}>
              <Text style={styles.categoryBadgeText}>{doc.category}</Text>
            </View>
            {doc.notes && <Text style={styles.viewerNotes}>{doc.notes}</Text>}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },

  headline: { fontSize: 22, fontWeight: '700', color: FreepassColors.text, marginBottom: 4 },
  subhead: { fontSize: 15, color: FreepassColors.textSecondary, lineHeight: 22, marginBottom: 20 },

  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 },
  loadingText: { fontSize: 14, color: FreepassColors.textSecondary },

  emptyCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  signUpBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 24,
  },
  signUpBtnText: { fontSize: 15, fontWeight: '700', color: FreepassColors.white },

  // Document row
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.cardBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  thumbContainer: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden' },
  thumb: { width: 56, height: 56 },
  thumbPlaceholder: {
    backgroundColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 16, fontWeight: '600', color: FreepassColors.text },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '700', color: FreepassColors.white },
  docDate: { fontSize: 12, color: FreepassColors.textSecondary },
  docNotes: { fontSize: 13, color: FreepassColors.textSecondary, marginTop: 4 },

  // Footer (add button)
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
    backgroundColor: FreepassColors.white,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: { fontSize: 15, fontWeight: '700', color: FreepassColors.white },

  // Picker sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: {
    backgroundColor: FreepassColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: FreepassColors.lightGray,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: FreepassColors.text, marginBottom: 16 },
  sheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: FreepassColors.cardBg,
    borderRadius: 12,
    marginBottom: 10,
  },
  sheetButtonText: { fontSize: 16, fontWeight: '500', color: FreepassColors.text },
  sheetCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  sheetCancelText: { fontSize: 16, fontWeight: '600', color: FreepassColors.textSecondary },

  // Upload modal
  uploadSheet: {
    backgroundColor: FreepassColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  uploadSheetContent: { padding: 20, paddingBottom: 40 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: FreepassColors.cardBg,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: FreepassColors.text,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  categoryPicker: { flexDirection: 'row' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: FreepassColors.offWhite,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: '500', color: FreepassColors.text },
  categoryChipTextActive: { color: FreepassColors.white },
  saveBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: FreepassColors.white },

  // Viewer
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)' },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 12,
  },
  viewerIconBtn: { padding: 8 },
  viewerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.white,
    textAlign: 'center',
  },
  viewerBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  viewerImage: { width: '100%', height: '100%' },
  viewerFooter: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewerNotes: { flex: 1, fontSize: 14, color: FreepassColors.white, lineHeight: 20 },
});
