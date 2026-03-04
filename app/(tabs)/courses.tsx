import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function CoursesScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="Courses" showLogo={false} showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <IconSymbol name="play.rectangle.fill" size={64} color={FreepassColors.accentLight} />
          <Text style={styles.placeholderTitle}>Courses</Text>
          <Text style={styles.placeholderText}>
            Training and educational resources will appear here. Check back soon for new content.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { flex: 1, padding: 20, justifyContent: 'center', paddingBottom: 40 },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: FreepassColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
});
