import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function EditMessageModal() {
  const { messageId, currentText } = useLocalSearchParams<{ messageId: string; currentText: string }>();
  const [text, setText] = useState(currentText ?? '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentText) setText(currentText);
  }, [currentText]);

  const handleUpdate = async () => {
    if (!text.trim()) {
      Alert.alert('Empty message', 'Please enter a message.');
      return;
    }
    if (!messageId) {
      Alert.alert('Error', 'Could not identify the message.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('community_posts').update({ content: text.trim() }).eq('id', messageId);
    setSubmitting(false);
    if (error) {
      Alert.alert('Error', 'Could not update the message. Please try again.');
      return;
    }
    Alert.alert('Updated', 'Your message has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    if (!messageId) return;
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('community_posts').delete().eq('id', messageId);
          if (error) {
            Alert.alert('Error', 'Could not delete the message.');
            return;
          }
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Message</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <TextInput
          style={styles.input}
          placeholder="Edit your message..."
          placeholderTextColor={FreepassColors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable
          style={[styles.updateBtn, submitting && { opacity: 0.5 }]}
          onPress={handleUpdate}
          disabled={submitting}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.btnText}>{submitting ? 'UPDATING...' : 'UPDATE'}</Text>
        </Pressable>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.btnText}>CANCEL</Text>
        </Pressable>
        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.btnText}>DELETE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreepassColors.primaryDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
    paddingTop: 0,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: FreepassColors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  updateBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelBtn: {
    backgroundColor: FreepassColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: FreepassColors.destructive,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
