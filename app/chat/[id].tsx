import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassColors } from '@/constants/theme';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <FreepassHeader title={`Chat`} showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Message thread with organization</Text>
          <Text style={styles.placeholderSub}>Messages will appear here</Text>
        </View>
      </ScrollView>
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={FreepassColors.textSecondary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { flex: 1, padding: 20, justifyContent: 'center' },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
  },
  placeholderSub: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginTop: 4,
  },
  inputBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
    backgroundColor: FreepassColors.white,
  },
  input: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: FreepassColors.text,
  },
});
