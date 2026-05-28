import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';

export default function AddEventScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [form, setForm] = useState({
    name: '',
    instructor: '',
    description: '',
    location: '',
    address: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert('Missing info', 'Please enter an event name.');
      return;
    }
    if (!form.startTime.trim()) {
      Alert.alert('Missing info', 'Please enter a start date and time.');
      return;
    }
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please create an account or log in before submitting an event.');
      return;
    }

    const eventDate = new Date(form.startTime.trim());
    if (isNaN(eventDate.getTime())) {
      Alert.alert('Invalid Date', 'Please enter the start time in a recognizable format, e.g. "May 15, 2026 4:00 PM".');
      return;
    }

    const endDate = form.endTime.trim() ? new Date(form.endTime.trim()) : null;

    setLoading(true);
    try {
      const { error } = await supabase.from('events').insert({
        title: form.name.trim(),
        description: form.description.trim() || null,
        instructor: form.instructor.trim() || null,
        location: form.location.trim() || null,
        address: form.address.trim() || null,
        event_date: eventDate.toISOString(),
        end_date: endDate && !isNaN(endDate.getTime()) ? endDate.toISOString() : null,
        is_published: false,
      });

      if (error) throw error;

      Alert.alert('Event Submitted', 'Your event has been submitted for review and will appear after approval.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Could Not Submit Event', (err as Error).message || 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [form, user]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add New Event to Calendar</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
          label="Location Name"
          placeholder="e.g. Fountain Fund Office"
          value={form.location}
          onChangeText={(v) => updateField('location', v)}
        />
        <InputField
          label="Address"
          placeholder="e.g. 1234 Broad St, Philadelphia, PA"
          value={form.address}
          onChangeText={(v) => updateField('address', v)}
        />
        <InputField
          label="Description"
          placeholder="Enter description..."
          value={form.description}
          onChangeText={(v) => updateField('description', v)}
          multiline
        />
        <InputField
          label="Start Date & Time *"
          placeholder='e.g. "May 15, 2026 4:00 PM"'
          value={form.startTime}
          onChangeText={(v) => updateField('startTime', v)}
        />
        <InputField
          label="End Date & Time"
          placeholder='e.g. "May 15, 2026 6:00 PM"'
          value={form.endTime}
          onChangeText={(v) => updateField('endTime', v)}
        />

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>
            {loading ? 'CREATING EVENT...' : 'CREATE EVENT'}
          </Text>
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
    paddingTop: 12,
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
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
