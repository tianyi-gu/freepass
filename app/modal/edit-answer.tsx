import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function EditAnswerModal() {
  const [text, setText] = useState('');

  const handleUpdate = () => {
    if (!text.trim()) {
      Alert.alert('Empty answer', 'Please enter your answer.');
      return;
    }
    // TODO: Update via backend
    Alert.alert('Updated', 'Your answer has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Answer', 'Are you sure you want to delete this answer?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit an Answer</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <TextInput
          style={styles.input}
          placeholder="Edit your answer..."
          placeholderTextColor={FreepassColors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />
        <Pressable style={styles.updateBtn} onPress={handleUpdate} android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.btnText}>UPDATE</Text>
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
