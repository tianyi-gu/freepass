import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ONBOARDING_STEPS, SurveyQuestion } from '@/constants/onboarding-questions';
import { FreepassColors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { user, saveSurveyAnswers, completeOnboarding } = useUser();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [done, setDone] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, []);

  const step = ONBOARDING_STEPS[stepIndex];
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;
  const progress = (stepIndex + 1) / ONBOARDING_STEPS.length;

  const setAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const toggleMulti = useCallback((questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  }, []);

  const handleNext = useCallback(async () => {
    // Save answers for this step
    await saveSurveyAnswers(answers);

    if (isLastStep) {
      setDone(true);
    } else {
      setStepIndex((i) => i + 1);
      scrollToTop();
    }
  }, [answers, isLastStep, saveSurveyAnswers, scrollToTop]);

  const handleSkipAll = useCallback(async () => {
    await completeOnboarding();
    router.replace('/(drawer)');
  }, [completeOnboarding]);

  if (done) {
    return (
      <View style={[styles.container, styles.doneContainer]}>
        <IconSymbol name="checkmark.circle.fill" size={80} color={FreepassColors.accent} />
        <Text style={styles.doneTitle}>You&apos;re all set!</Text>
        <Text style={styles.doneBody}>
          Your responses have been saved. We&apos;ll use them to show you the most relevant resources and support for your reentry journey.
        </Text>
        <Pressable
          style={styles.doneBtn}
          onPress={async () => {
            await completeOnboarding();
            router.replace('/(drawer)');
          }}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.doneBtnText}>Explore FreePass</Text>
        </Pressable>
      </View>
    );
  }

  const renderQuestion = (q: SurveyQuestion) => {
    if (q.type === 'text') {
      return (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.subtitle && <Text style={styles.questionSubtitle}>{q.subtitle}</Text>}
          <TextInput
            style={styles.textInput}
            value={(answers[q.id] as string) || ''}
            onChangeText={(text) => setAnswer(q.id, text)}
            placeholder="Type here..."
            placeholderTextColor={FreepassColors.textSecondary}
            autoCapitalize={q.id === 'zip_code' ? 'none' : 'words'}
            keyboardType={q.id === 'zip_code' ? 'number-pad' : 'default'}
          />
        </View>
      );
    }

    if (q.type === 'single') {
      return (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.subtitle && <Text style={styles.questionSubtitle}>{q.subtitle}</Text>}
          {q.options?.map((option) => {
            const selected = answers[q.id] === option;
            return (
              <Pressable
                key={option}
                style={[styles.optionBtn, selected && styles.optionBtnSelected]}
                onPress={() => setAnswer(q.id, option)}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      );
    }

    // multi-select
    const selectedItems = (answers[q.id] as string[]) || [];
    return (
      <View key={q.id} style={styles.questionBlock}>
        <Text style={styles.questionText}>{q.question}</Text>
        {q.subtitle && <Text style={styles.questionSubtitle}>{q.subtitle}</Text>}
        <View style={styles.chipContainer}>
          {q.options?.map((option) => {
            const selected = selectedItems.includes(option);
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleMulti(q.id, option)}>
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Let&apos;s personalize your experience</Text>
          <Pressable onPress={handleSkipAll} hitSlop={12}>
            <Text style={styles.skipAllText}>Skip all</Text>
          </Pressable>
        </View>
        {user?.displayName ? (
          <Text style={styles.headerGreeting}>
            Welcome, {user.displayName}! A few quick questions to help us help you.
          </Text>
        ) : (
          <Text style={styles.headerGreeting}>
            A few quick questions so we can show you what matters most.
          </Text>
        )}
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.stepLabel}>
          Step {stepIndex + 1} of {ONBOARDING_STEPS.length} — {step.title}
        </Text>
      </View>

      {/* Questions */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {step.questions.map(renderQuestion)}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {stepIndex > 0 && (
          <Pressable
            style={styles.backBtn}
            onPress={() => { setStepIndex((i) => i - 1); scrollToTop(); }}>
            <IconSymbol name="chevron.left" size={18} color={FreepassColors.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.nextBtn, stepIndex === 0 && { flex: 1 }]}
          onPress={handleNext}
          android_ripple={{ color: FreepassColors.primaryDark }}>
          <Text style={styles.nextBtnText}>{isLastStep ? 'Get Started' : 'Continue'}</Text>
          {!isLastStep && (
            <IconSymbol name="chevron.right" size={18} color={FreepassColors.white} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FreepassColors.white },
  doneContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  doneTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: FreepassColors.text,
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  doneBody: {
    fontSize: 16,
    lineHeight: 24,
    color: FreepassColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  doneBtn: {
    backgroundColor: FreepassColors.accent,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: FreepassColors.white,
  },
  header: {
    backgroundColor: FreepassColors.primary,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: FreepassColors.white,
    flex: 1,
  },
  skipAllText: {
    fontSize: 14,
    color: FreepassColors.accentLight,
    fontWeight: '600',
    marginLeft: 16,
  },
  headerGreeting: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
    marginBottom: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: FreepassColors.accentLight,
    borderRadius: 2,
  },
  stepLabel: {
    fontSize: 13,
    color: FreepassColors.accentLight,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 32 },
  questionBlock: {
    marginBottom: 28,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: FreepassColors.text,
    marginBottom: 4,
  },
  questionSubtitle: {
    fontSize: 14,
    color: FreepassColors.textSecondary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: FreepassColors.text,
    marginTop: 8,
    borderWidth: 1,
    borderColor: FreepassColors.lightGray,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: FreepassColors.offWhite,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: FreepassColors.lightGray,
  },
  optionBtnSelected: {
    borderColor: FreepassColors.accent,
    backgroundColor: '#E8F5E9',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: FreepassColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: FreepassColors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FreepassColors.accent,
  },
  optionText: {
    fontSize: 16,
    color: FreepassColors.text,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: FreepassColors.accent,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: FreepassColors.offWhite,
    borderWidth: 1.5,
    borderColor: FreepassColors.lightGray,
  },
  chipSelected: {
    backgroundColor: FreepassColors.accent,
    borderColor: FreepassColors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: FreepassColors.text,
  },
  chipTextSelected: {
    color: FreepassColors.white,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 36,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: FreepassColors.lightGray,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: FreepassColors.lightGray,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: FreepassColors.primary,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: FreepassColors.accent,
    paddingVertical: 16,
    borderRadius: 12,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: FreepassColors.white,
  },
});
