import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassColors } from '@/constants/theme';

export default function AddEventScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add New Event to Calendar</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <InputField label="Event Name" placeholder="Enter event name..." />
        <InputField label="Instructor / Host" placeholder="Enter instructor / host..." />
        <InputField label="Main Image" placeholder="Choose Photo" multiline />
        <InputField label="Contact Phone" placeholder="Enter phone number..." />
        <InputField label="Description" placeholder="Enter description..." />
        <InputField label="Start Time" placeholder="Thursday, May 4th, 2024 at 4:00 PM" />
        <InputField label="End Time" placeholder="Thursday, May 4th, 2024 at 4:00 PM" />

        <Pressable
          style={styles.submitBtn}
          onPress={() => router.back()}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>CREATE EVENT</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function InputField({
  label,
  placeholder,
  multiline,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={FreepassColors.textSecondary}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  header: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: FreepassColors.offWhite,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.offWhite,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: FreepassColors.offWhite,
    marginBottom: 8,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: FreepassColors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
