import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader } from '@/components/freepass-header';
import { FreepassLogo } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showBack showMenu={false} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.branding}>
          <Text style={styles.subtitle}>The Fountain Fund Philadelphia</Text>
          <FreepassLogo size={48} />
          <Text style={styles.title}>FreePass</Text>
          <Text style={styles.lead}>New user screen. Login/Signup</Text>
        </View>

        <Text style={styles.welcomeText}>
          Welcome to your comprehensive resource portal – designed to empower the successful reentry journey in
          Philadelphia and expanding areas.
        </Text>

        <Pressable
          style={styles.signupBtn}
          onPress={() => router.back()}
          android_ripple={{ color: FreepassColors.accent }}>
          <IconSymbol name="plus" size={20} color={FreepassColors.white} />
          <Text style={styles.signupBtnText}>SIGN UP</Text>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email..."
            placeholderTextColor={FreepassColors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password..."
            placeholderTextColor={FreepassColors.textSecondary}
            secureTextEntry
          />
        </View>
        <Pressable
          style={styles.loginBtn}
          onPress={() => router.back()}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.loginBtnText}>LOG IN</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  branding: {
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: FreepassColors.white,
    marginTop: 8,
  },
  lead: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.white,
    marginBottom: 24,
    opacity: 0.95,
  },
  signupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  signupBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: FreepassColors.accentLight,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FreepassColors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: FreepassColors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: FreepassColors.text,
  },
  loginBtn: {
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
