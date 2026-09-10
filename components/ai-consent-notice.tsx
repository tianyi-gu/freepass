import { router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  AI_CHOICE_TEXT,
  AI_DATA_SENT,
  AI_PROVIDERS,
  AI_PURPOSE_TEXT,
  AiDisclosureItem,
  PRIVACY_POLICY_URL,
} from '@/constants/ai-consent';
import { FreepassColors } from '@/constants/theme';
import { openWebUrl } from '@/lib/links';

// Button labels are referenced by the Maestro flows (.maestro/04-casey-chat.yaml).
export const AI_CONSENT_ACCEPT_LABEL = 'I AGREE — TURN ON CASEY';
export const AI_CONSENT_DECLINE_LABEL = 'Not now';

export async function openPrivacyPolicy(): Promise<void> {
  try {
    await openBrowserAsync(PRIVACY_POLICY_URL);
  } catch {
    await openWebUrl(PRIVACY_POLICY_URL);
  }
}

function DisclosureList({ items }: { items: AiDisclosureItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.title} style={styles.listItem}>
          <View style={styles.bullet} />
          <Text style={styles.listText}>
            <Text style={styles.listTitle}>{item.title}. </Text>
            {item.detail}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Full informed-consent screen shown before Casey can be used. Nothing is
// sent to any AI provider until the user taps the accept button.
export function AiConsentNotice({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.iconWrap}>
        <IconSymbol name="sparkles" size={28} color={FreepassColors.white} />
      </View>
      <Text style={styles.title}>Before you chat with Casey</Text>
      <Text style={styles.lead}>
        Casey is an AI helper. To answer you, FreePass has to send some of your information to
        outside companies that run the AI. Here is exactly what that means, so you can decide.
      </Text>

      <Text style={styles.sectionTitle}>What gets sent</Text>
      <DisclosureList items={AI_DATA_SENT} />

      <Text style={styles.sectionTitle}>Who receives it</Text>
      <DisclosureList items={AI_PROVIDERS} />

      <Text style={styles.sectionTitle}>Why</Text>
      <Text style={styles.body}>{AI_PURPOSE_TEXT}</Text>

      <Text style={styles.sectionTitle}>Your choice</Text>
      <Text style={styles.body}>{AI_CHOICE_TEXT}</Text>

      <Pressable
        onPress={openPrivacyPolicy}
        accessibilityRole="link"
        accessibilityLabel="Read the FreePass privacy policy"
        style={styles.policyLink}>
        <Text style={styles.policyLinkText}>Read our Privacy Policy</Text>
      </Pressable>

      <Pressable
        style={styles.acceptBtn}
        onPress={onAccept}
        accessibilityRole="button"
        accessibilityLabel="I agree, turn on Casey"
        android_ripple={{ color: FreepassColors.accentLight }}>
        <Text style={styles.acceptBtnText}>{AI_CONSENT_ACCEPT_LABEL}</Text>
      </Pressable>
      <Pressable
        style={styles.declineBtn}
        onPress={onDecline}
        accessibilityRole="button"
        accessibilityLabel="Not now, keep Casey turned off">
        <Text style={styles.declineBtnText}>{AI_CONSENT_DECLINE_LABEL}</Text>
      </Pressable>

      <Text style={styles.crisisNote}>
        Need help right now? Call 211 for local services, or call or text 988 in a crisis.
      </Text>
    </ScrollView>
  );
}

// Shown when the user has declined. Casey is off; the rest of the app works.
export function AiDisabledNotice({ onTurnOn }: { onTurnOn: () => void }) {
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, styles.disabledContent]}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.iconWrap, styles.iconWrapMuted]}>
        <IconSymbol name="sparkles" size={28} color={FreepassColors.textSecondary} />
      </View>
      <Text style={styles.title}>Casey is turned off</Text>
      <Text style={[styles.body, styles.centered]}>
        You chose not to share information with the AI companies that power Casey, so Casey is
        off. Everything else in FreePass works as usual, and you can turn Casey on any time.
      </Text>
      <Pressable
        style={styles.acceptBtn}
        onPress={onTurnOn}
        accessibilityRole="button"
        accessibilityLabel="Review the AI notice and turn on Casey"
        android_ripple={{ color: FreepassColors.accentLight }}>
        <Text style={styles.acceptBtnText}>TURN ON CASEY</Text>
      </Pressable>
      <Pressable
        style={styles.declineBtn}
        onPress={() => router.push('/quick-list' as never)}
        accessibilityRole="button"
        accessibilityLabel="Browse resources instead">
        <Text style={styles.declineBtnText}>Browse resources instead</Text>
      </Pressable>
      <Text style={styles.crisisNote}>
        Need help right now? Call 211 for local services, or call or text 988 in a crisis.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  disabledContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FreepassColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  iconWrapMuted: {
    backgroundColor: FreepassColors.cardBg,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: FreepassColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.text,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: FreepassColors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: FreepassColors.text,
  },
  centered: {
    textAlign: 'center',
    marginBottom: 24,
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FreepassColors.accent,
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: FreepassColors.text,
  },
  listTitle: {
    fontWeight: '700',
  },
  policyLink: {
    alignSelf: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  policyLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: FreepassColors.accent,
    textDecorationLine: 'underline',
  },
  acceptBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  declineBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    alignSelf: 'stretch',
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.textSecondary,
  },
  crisisNote: {
    fontSize: 13,
    lineHeight: 18,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
