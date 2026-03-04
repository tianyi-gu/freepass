import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function AskQuestionModal() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ask a Question</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={FreepassColors.white} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>What is your question?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter question..."
          placeholderTextColor={FreepassColors.textSecondary}
          multiline
        />
        <Text style={styles.label}>What category does this question fit into?</Text>
        <TextInput
          style={styles.input}
          placeholder="Select question category..."
          placeholderTextColor={FreepassColors.textSecondary}
        />
        <Pressable
          style={styles.submitBtn}
          onPress={() => router.back()}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>ASK QUESTION</Text>
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
  label: {
    fontSize: 15,
    color: FreepassColors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: FreepassColors.text,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
