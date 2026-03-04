import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassColors } from '@/constants/theme';

export default function UserGuideDrawerScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader title="New User Guide" showLogo showMenu showBack={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Welcome to Freepass</Text>
        <Text style={styles.intro}>
          Freepass helps individuals with societal reintegration by providing access to housing, employment, and
          community resources.
        </Text>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <Text style={styles.body}>
          1. Use the Category Search to browse resources by type: Housing, Employment, or Low Income Assistance.{'\n'}
          2. Tap Resources Near You to find organizations in your area.{'\n'}
          3. The Q&A section lets you ask questions and see answers from staff and the community.{'\n'}
          4. Events helps you stay on track with appointments and community events.
        </Text>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.body}>
          FreePass staff regularly monitor the Q&A page. Ask a question anytime, and check back for answers from our
          team or community members.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
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
