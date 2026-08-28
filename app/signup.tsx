import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { FreepassHeader, FreepassLogo } from '@/components/freepass-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';

type Mode = 'welcome' | 'signup' | 'login' | 'confirmed' | 'forgot' | 'reset';

export default function SignupScreen() {
  const { signUp, logIn, continueAsGuest, resetPassword, confirmPasswordReset, resendConfirmation } = useUser();
  const [mode, setMode] = useState<Mode>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSignUp = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields to create your account.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim(), zipCode.trim() || undefined);
      setMode('confirmed');
    } catch (err) {
      const msg = (err as Error).message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        Alert.alert(
          'Account already exists',
          'An account with this email already exists. Would you like to log in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log In', onPress: () => { setMode('login'); } },
          ],
        );
      } else {
        Alert.alert('Sign Up Failed', msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [name, email, password, zipCode, signUp]);

  const handleLogIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await logIn(email.trim(), password);
      router.replace('/(drawer)');
    } catch (err) {
      Alert.alert('Login Failed', (err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, logIn]);

  const handleGuest = useCallback(async () => {
    await continueAsGuest();
    router.replace('/(drawer)');
  }, [continueAsGuest]);

  const handleSendReset = useCallback(async () => {
    if (!email.trim()) {
      Alert.alert('Missing info', 'Please enter the email you signed up with.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setMode('reset');
    } catch (err) {
      Alert.alert('Could not send reset email', (err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, resetPassword]);

  const handleConfirmReset = useCallback(async () => {
    if (!resetCode.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please enter the code from your email and a new password.');
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(email.trim(), resetCode, password);
      Alert.alert('Password updated', 'You are now logged in with your new password.');
      router.replace('/(drawer)');
    } catch (err) {
      Alert.alert(
        'Could not reset password',
        (err as Error).message || 'The code may be wrong or expired. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [email, resetCode, password, confirmPasswordReset]);

  const handleResendConfirmation = useCallback(async () => {
    setResending(true);
    try {
      await resendConfirmation(email.trim());
      Alert.alert('Email sent', `We sent another confirmation email to ${email.trim()}.`);
    } catch (err) {
      Alert.alert('Could not resend', (err as Error).message || 'Please try again in a minute.');
    } finally {
      setResending(false);
    }
  }, [email, resendConfirmation]);

  if (mode === 'confirmed') {
    return (
      <View style={styles.container}>
        <FreepassHeader showLogo showBack={false} showMenu={false} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, styles.confirmedContent]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}>
          <IconSymbol name="checkmark.circle.fill" size={72} color={FreepassColors.accentLight} />
          <Text style={styles.confirmedTitle}>Account Created!</Text>
          <Text style={styles.confirmedBody}>
            Welcome to FreePass. Check your inbox (and spam folder) for a confirmation email sent
            to {email}, and tap the link inside — you&apos;ll need to confirm before you can log in.
          </Text>
          <Pressable style={styles.skipLink} onPress={handleResendConfirmation} disabled={resending}>
            <Text style={styles.skipLinkText}>
              {resending ? 'Sending…' : "Didn't get it? Resend the email"}
            </Text>
          </Pressable>
          <Text style={styles.confirmedNote}>
            Next, answer a few quick questions so we can personalize your experience.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace('/onboarding' as never)}
            android_ripple={{ color: FreepassColors.accent }}>
            <Text style={styles.primaryBtnText}>TAKE THE SURVEY</Text>
          </Pressable>
          <Pressable
            style={styles.skipLink}
            onPress={() => router.replace('/(drawer)' as never)}>
            <Text style={styles.skipLinkText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FreepassHeader showLogo showBack={mode !== 'welcome'} showMenu={false} />
      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}>
        <View style={styles.branding}>
          <Text style={styles.subtitle}>The Fountain Fund Philadelphia</Text>
          <FreepassLogo size={48} />
          <Text style={styles.title}>FreePass</Text>
        </View>

        {mode === 'welcome' && (
          <>
            <Text style={styles.welcomeText}>
              Welcome to your comprehensive resource portal – designed to empower the successful
              reentry journey in Philadelphia and expanding areas.
            </Text>

            <Text style={styles.encourageText}>
              Create a free account to get personalized resources, save your favorites, and connect
              with the community.
            </Text>

            <Pressable
              style={styles.primaryBtn}
              onPress={() => setMode('signup')}
              android_ripple={{ color: FreepassColors.accent }}>
              <IconSymbol name="plus" size={20} color={FreepassColors.white} />
              <Text style={styles.primaryBtnText}>CREATE AN ACCOUNT</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => setMode('login')}
              android_ripple={{ color: FreepassColors.primaryDark }}>
              <Text style={styles.secondaryBtnText}>LOG IN</Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable style={styles.guestBtn} onPress={handleGuest}>
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </Pressable>
            <Text style={styles.guestNote}>
              You can create an account later from your profile.
            </Text>
          </>
        )}

        {mode === 'signup' && (
          <>
            <Text style={styles.formTitle}>Create Your Account</Text>
            <Text style={styles.formSubtitle}>
              This helps us personalize your experience and connect you with the right resources.
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="What should we call you?"
                placeholderTextColor={FreepassColors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="next"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Zip Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Your Philadelphia zip code (optional)"
                placeholderTextColor={FreepassColors.textSecondary}
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="number-pad"
                maxLength={5}
                returnKeyType="done"
              />
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              android_ripple={{ color: FreepassColors.accent }}>
              <Text style={styles.primaryBtnText}>
                {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.switchBtn}
              onPress={() => { setMode('login'); setPassword(''); }}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLink}>Log in</Text>
              </Text>
            </Pressable>
          </>
        )}

        {mode === 'login' && (
          <>
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>
              Log in to access your saved resources and personalized experience.
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={email}
                onChangeText={setEmail}
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
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogIn}
              disabled={loading}
              android_ripple={{ color: FreepassColors.accent }}>
              <Text style={styles.primaryBtnText}>
                {loading ? 'LOGGING IN...' : 'LOG IN'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.switchBtn}
              onPress={() => { setMode('forgot'); setPassword(''); }}>
              <Text style={styles.switchText}>
                <Text style={styles.switchLink}>Forgot your password?</Text>
              </Text>
            </Pressable>

            <Pressable
              style={styles.switchBtn}
              onPress={() => { setMode('signup'); setPassword(''); }}>
              <Text style={styles.switchText}>
                Don&apos;t have an account? <Text style={styles.switchLink}>Sign up</Text>
              </Text>
            </Pressable>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <Text style={styles.formTitle}>Reset Your Password</Text>
            <Text style={styles.formSubtitle}>
              Enter the email you signed up with and we&apos;ll send you a reset code.
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSendReset}
              disabled={loading}
              android_ripple={{ color: FreepassColors.accent }}>
              <Text style={styles.primaryBtnText}>
                {loading ? 'SENDING...' : 'SEND RESET EMAIL'}
              </Text>
            </Pressable>

            <Pressable style={styles.switchBtn} onPress={() => setMode('login')}>
              <Text style={styles.switchText}>
                Remembered it? <Text style={styles.switchLink}>Log in</Text>
              </Text>
            </Pressable>
          </>
        )}

        {mode === 'reset' && (
          <>
            <Text style={styles.formTitle}>Check Your Email</Text>
            <Text style={styles.formSubtitle}>
              We sent a reset email to {email}. Enter the code from that email and choose a new
              password.
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Reset Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the code from the email..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="number-pad"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a new password..."
                placeholderTextColor={FreepassColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
              />
            </View>

            <Pressable
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleConfirmReset}
              disabled={loading}
              android_ripple={{ color: FreepassColors.accent }}>
              <Text style={styles.primaryBtnText}>
                {loading ? 'UPDATING...' : 'SET NEW PASSWORD'}
              </Text>
            </Pressable>

            <Pressable style={styles.switchBtn} onPress={handleSendReset} disabled={loading}>
              <Text style={styles.switchText}>
                Didn&apos;t get it? <Text style={styles.switchLink}>Resend the email</Text>
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  confirmedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingTop: 40,
  },
  confirmedTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: FreepassColors.white,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmedBody: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.white,
    textAlign: 'center',
    opacity: 0.95,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  confirmedNote: {
    fontSize: 14,
    lineHeight: 21,
    color: FreepassColors.accentLight,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  skipLink: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  skipLinkText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
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
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.white,
    marginBottom: 12,
    opacity: 0.95,
  },
  encourageText: {
    fontSize: 14,
    lineHeight: 21,
    color: FreepassColors.accentLight,
    marginBottom: 24,
    fontWeight: '500',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: FreepassColors.accentLight,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FreepassColors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  guestBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  guestBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.white,
  },
  guestNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FreepassColors.white,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 24,
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
  switchBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  switchLink: {
    color: FreepassColors.accentLight,
    fontWeight: '700',
  },
});
