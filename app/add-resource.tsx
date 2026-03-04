import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

function FormField({
  label,
  placeholder,
  multiline,
}: {
  label: string;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={FreepassColors.textSecondary}
        multiline={multiline}
      />
    </View>
  );
}

export default function AddResourceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={20} color={FreepassColors.white} />
        </Pressable>
        <Text style={styles.title}>Add a Resource to FreePass</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <FormField label="Company Name" placeholder="Enter Company Name..." />
        <View style={styles.field}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <View style={styles.locationInput}>
            <IconSymbol name="map.fill" size={20} color={FreepassColors.textSecondary} />
            <TextInput
              style={styles.inputInline}
              placeholder="Search by name or address."
              placeholderTextColor={FreepassColors.textSecondary}
            />
          </View>
        </View>
        <FormField label="Lat Long" placeholder="Enter Lat Long..." />
        <FormField label="TexID 1" placeholder="Enter tex ID 1..." />
        <FormField label="TexID 2" placeholder="Enter tex ID 2..." />
        <FormField label="Service Type 1" placeholder="Enter service type 1..." />
        <FormField label="Service Type 2" placeholder="Enter service type 2..." />
        <FormField label="Service Type 3" placeholder="Enter service type 3..." />
        <FormField label="About" placeholder="Enter about..." multiline />
        <FormField label="Text Description" placeholder="Enter text description..." multiline />
        <FormField label="Phone Number" placeholder="Enter phone number..." />
        <FormField label="Phone 2" placeholder="Enter phone 2..." />
        <FormField label="Extension" placeholder="Enter extension..." />
        <FormField label="Web Address" placeholder="Enter web address..." />
        <FormField label="Main Email" placeholder="Enter main email..." />
        <FormField label="Zip Code" placeholder="Enter zip code..." />
        <FormField label="Country" placeholder="Enter country..." />
        <FormField label="Region" placeholder="Enter region..." />
        <FormField label="Work Hours" placeholder="Enter hours..." />
        <FormField label="Date of Service" placeholder="Thursday, May 29, 2026 at 6:00 PM" />
        <FormField label="Main Contact" placeholder="Enter main contact..." />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Image</Text>
          <Pressable style={styles.imageUpload}>
            <Text style={styles.imageUploadText}>Choose Photo</Text>
          </Pressable>
        </View>
        <FormField label="Tags" placeholder="Enter tags..." />
        <FormField label="Notes" placeholder="Enter notes..." multiline />
        <View style={styles.field}>
          <View style={styles.verifyRow}>
            <View style={styles.radio} />
            <Text style={styles.fieldLabel}>Verify</Text>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.sectionLabel}>SEARCH INDEX</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter search index..."
            placeholderTextColor={FreepassColors.textSecondary}
          />
        </View>

        <Pressable
          style={styles.submitBtn}
          onPress={() => router.back()}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.submitBtnText}>CREATE FREE PASS RESOURCE</Text>
        </Pressable>
        <Text style={styles.thankYou}>THANK YOU!</Text>
      </ScrollView>
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
    paddingTop: 48,
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
  imageUpload: {
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadText: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: FreepassColors.primary,
  },
  submitBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  thankYou: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.primary,
    textAlign: 'center',
  },
});
