import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassColors } from '@/constants/theme';

export default function AddEventScreen() {
  const [form, setForm] = useState({
    name: '',
    instructor: '',
    phone: '',
    description: '',
    startTime: '',
    endTime: '',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Missing info', 'Please enter an event name.');
      return;
    }
    if (!form.startTime.trim()) {
      Alert.alert('Missing info', 'Please enter a start time.');
      return;
    }
    // TODO: Submit to backend
    Alert.alert('Event Created', 'Your event has been submitted for review.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [form]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add New Event to Calendar</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <InputField
          label="Event Name *"
          placeholder="Enter event name..."
          value={form.name}
          onChangeText={(v) => updateField('name', v)}
        />
        <InputField
          label="Instructor / Host"
          placeholder="Enter instructor / host..."
          value={form.instructor}
          onChangeText={(v) => updateField('instructor', v)}
        />
        <InputField
          label="Contact Phone"
          placeholder="Enter phone number..."
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          keyboardType="phone-pad"
        />
        <InputField
          label="Description"
          placeholder="Enter description..."
          value={form.description}
          onChangeText={(v) => updateField('description', v)}
          multiline
        />
        <InputField
          label="Start Time *"
          placeholder="e.g. May 15, 2026 at 4:00 PM"
          value={form.startTime}
          onChangeText={(v) => updateField('startTime', v)}
        />
        <InputField
          label="End Time"
          placeholder="e.g. May 15, 2026 at 6:00 PM"
          value={form.endTime}
          onChangeText={(v) => updateField('endTime', v)}
        />

        <Pressable
          style={styles.submitBtn}
          onPress={handleSubmit}
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
  value,
  onChangeText,
  multiline,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={FreepassColors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
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
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
