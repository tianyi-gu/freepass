import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassColors } from '@/constants/theme';

export default function UserGuideScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="New User Guide" showBack showLogo={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to Freepass</Text>
        <Text style={styles.intro}>
          Freepass helps individuals with societal reintegration by providing access to housing, employment, and
          community resources.
        </Text>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.body}>
          1. Use the Category Search to browse resources by type, like housing or employment.{'\n'}
          2. Tap Resources Near You to find organizations close to your location.{'\n'}
          3. The Q&A section lets you ask questions and see answers from the community.{'\n'}
          4. Events helps you stay on track with appointments and community events.
        </Text>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.body}>
          You can post a question on the Q&A page anytime — answers come from the community and
          may take time. For anything urgent, call 211, or contact an organization directly from
          Resources.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 16,
  },
  intro: {
    fontSize: 16,
    color: FreepassColors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.primary,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    color: FreepassColors.text,
    lineHeight: 24,
    marginBottom: 24,
  },
});
