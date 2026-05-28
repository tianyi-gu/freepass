import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { supabase } from '@/lib/supabase';

export default function AddResourceScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [form, setForm] = useState({
    companyName: '',
    location: '',
    serviceType1: '',
    serviceType2: '',
    serviceType3: '',
    about: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    zipCode: '',
    hours: '',
    mainContact: '',
    tags: '',
    notes: '',
    verified: false,
  });

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!form.companyName.trim()) {
      Alert.alert('Missing info', 'Please enter a company name.');
      return;
    }
    if (!form.phone.trim() && !form.email.trim()) {
      Alert.alert('Missing info', 'Please enter at least a phone number or email.');
      return;
    }
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please create an account or log in before submitting a resource.');
      return;
    }
    setSubmitting(true);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (form.serviceType1.trim()) tags.push(form.serviceType1.trim());
    if (form.serviceType2.trim()) tags.push(form.serviceType2.trim());
    if (form.serviceType3.trim()) tags.push(form.serviceType3.trim());

    const { error } = await supabase.from('resources').insert({
      name: form.companyName.trim(),
      address: form.location.trim() || null,
      description: form.description.trim() || form.about.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      city: 'Philadelphia',
      state: 'PA',
      zip_code: form.zipCode.trim() || null,
      hours: form.hours.trim() || null,
      tags,
      is_published: false,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Could Not Submit Resource', error.message || 'Please check your connection and try again.');
      return;
    }
    Alert.alert('Resource Submitted', 'Thank you. Your resource has been submitted for review and will appear after approval.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }, [form, user]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={20} color={FreepassColors.white} />
        </Pressable>
        <Text style={styles.title}>Add a Resource to FreePass</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <FormField
          label="Company Name *"
          placeholder="Enter Company Name..."
          value={form.companyName}
          onChangeText={(v) => updateField('companyName', v)}
        />
        <View style={styles.field}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <View style={styles.locationInput}>
            <IconSymbol name="map.fill" size={20} color={FreepassColors.textSecondary} />
            <TextInput
              style={styles.inputInline}
              placeholder="Search by name or address."
              placeholderTextColor={FreepassColors.textSecondary}
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
            />
          </View>
        </View>
        <FormField label="Service Type 1" placeholder="Enter service type..." value={form.serviceType1} onChangeText={(v) => updateField('serviceType1', v)} />
        <FormField label="Service Type 2" placeholder="Enter service type..." value={form.serviceType2} onChangeText={(v) => updateField('serviceType2', v)} />
        <FormField label="Service Type 3" placeholder="Enter service type..." value={form.serviceType3} onChangeText={(v) => updateField('serviceType3', v)} />
        <FormField label="About" placeholder="Enter about..." value={form.about} onChangeText={(v) => updateField('about', v)} multiline />
        <FormField label="Text Description" placeholder="Enter text description..." value={form.description} onChangeText={(v) => updateField('description', v)} multiline />
        <FormField label="Phone Number *" placeholder="Enter phone number..." value={form.phone} onChangeText={(v) => updateField('phone', v)} keyboardType="phone-pad" />
        <FormField label="Web Address" placeholder="Enter web address..." value={form.website} onChangeText={(v) => updateField('website', v)} keyboardType="url" />
        <FormField label="Main Email *" placeholder="Enter main email..." value={form.email} onChangeText={(v) => updateField('email', v)} keyboardType="email-address" />
        <FormField label="Zip Code" placeholder="Enter zip code..." value={form.zipCode} onChangeText={(v) => updateField('zipCode', v)} keyboardType="number-pad" />
        <FormField label="Work Hours" placeholder="e.g. Mon-Fri 9am-5pm" value={form.hours} onChangeText={(v) => updateField('hours', v)} />
        <FormField label="Main Contact" placeholder="Enter main contact..." value={form.mainContact} onChangeText={(v) => updateField('mainContact', v)} />
        <FormField label="Tags" placeholder="e.g. housing, legal, employment" value={form.tags} onChangeText={(v) => updateField('tags', v)} />
        <FormField label="Notes" placeholder="Enter notes..." value={form.notes} onChangeText={(v) => updateField('notes', v)} multiline />

        <Pressable
          style={styles.verifyRow}
          onPress={() => setForm((prev) => ({ ...prev, verified: !prev.verified }))}>
          <View style={[styles.radio, form.verified && styles.radioSelected]} />
          <Text style={styles.fieldLabel}>Verify this information is accurate</Text>
        </Pressable>

        <Pressable
          style={[styles.submitBtn, (!form.verified || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!form.verified || submitting}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>
            {submitting ? 'SUBMITTING...' : 'CREATE FREE PASS RESOURCE'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FormField({
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
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'url' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={FreepassColors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' || keyboardType === 'url' ? 'none' : 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: FreepassColors.destructive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.primary,
    textAlign: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  field: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: FreepassColors.textSecondary,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    color: FreepassColors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: FreepassColors.text,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  inputInline: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: FreepassColors.text,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: FreepassColors.primary,
  },
  radioSelected: {
    backgroundColor: FreepassColors.accent,
    borderColor: FreepassColors.accent,
  },
  submitBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
