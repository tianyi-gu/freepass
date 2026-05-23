/**
 * Onboarding survey questions for new FreePass users.
 * Designed to be trauma-informed, non-judgmental, and practically useful
 * for personalizing the reentry resource experience.
 */

export type QuestionType = 'single' | 'multi' | 'text';

export interface SurveyQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: QuestionType;
  options?: string[];
  allowSkip: boolean;
}

export interface SurveyStep {
  title: string;
  icon: string;
  questions: SurveyQuestion[];
}

export const ONBOARDING_STEPS: SurveyStep[] = [
  {
    title: 'About You',
    icon: 'person.fill',
    questions: [
      {
        id: 'preferred_name',
        question: 'What should we call you?',
        subtitle: 'A first name or nickname is fine.',
        type: 'text',
        allowSkip: true,
      },
      {
        id: 'zip_code',
        question: 'What area are you in?',
        subtitle: 'This helps us find resources near you.',
        type: 'text',
        allowSkip: true,
      },
      {
        id: 'time_home',
        question: 'How long have you been home?',
        type: 'single',
        options: [
          'Less than 1 month',
          '1–6 months',
          '6–12 months',
          'Over a year',
          'This doesn\'t apply to me',
        ],
        allowSkip: true,
      },
    ],
  },
  {
    title: 'What You Need',
    icon: 'heart.fill',
    questions: [
      {
        id: 'immediate_needs',
        question: 'What are you looking for help with right now?',
        subtitle: 'Select all that apply. You can always change this later.',
        type: 'multi',
        options: [
          'Housing',
          'Employment',
          'Legal aid',
          'Healthcare',
          'Mental health / counseling',
          'Substance use support',
          'Food access',
          'Transportation',
          'Education / GED',
          'Financial coaching',
          'ID / documents',
          'Family reconnection',
        ],
        allowSkip: true,
      },
    ],
  },
  {
    title: 'Work & Housing',
    icon: 'building.2.fill',
    questions: [
      {
        id: 'employment_status',
        question: 'What\'s your current work situation?',
        type: 'single',
        options: [
          'Employed',
          'Looking for work',
          'In a training program',
          'Not looking right now',
        ],
        allowSkip: true,
      },
      {
        id: 'work_interests',
        question: 'What kind of work interests you?',
        subtitle: 'Select all that apply.',
        type: 'multi',
        options: [
          'Construction / trades',
          'Food service / hospitality',
          'Warehouse / logistics',
          'Tech / computers',
          'Healthcare',
          'Retail / customer service',
          'Driving / delivery',
          'Starting my own business',
          'Other',
        ],
        allowSkip: true,
      },
      {
        id: 'housing_status',
        question: 'What\'s your current housing situation?',
        type: 'single',
        options: [
          'Stable housing',
          'Transitional / halfway house',
          'Staying with family or friends',
          'Shelter',
          'Need help with housing',
        ],
        allowSkip: true,
      },
    ],
  },
  {
    title: 'Finances & Education',
    icon: 'chart.line.uptrend.xyaxis',
    questions: [
      {
        id: 'financial_help',
        question: 'Would you like help with any of these?',
        subtitle: 'Select all that apply.',
        type: 'multi',
        options: [
          'Building credit',
          'Opening a bank account',
          'Managing debt',
          'Budgeting',
          'Getting a loan',
          'None right now',
        ],
        allowSkip: true,
      },
      {
        id: 'education_level',
        question: 'What\'s your education background?',
        type: 'single',
        options: [
          'Some high school',
          'GED',
          'High school diploma',
          'Some college',
          'College degree or higher',
        ],
        allowSkip: true,
      },
      {
        id: 'learning_interest',
        question: 'Are you interested in learning opportunities?',
        type: 'single',
        options: [
          'Yes, definitely',
          'Maybe later',
          'Not right now',
        ],
        allowSkip: true,
      },
    ],
  },
  {
    title: 'Your Support',
    icon: 'bubble.left.and.bubble.right.fill',
    questions: [
      {
        id: 'support_system',
        question: 'Do you have a support system you can rely on?',
        subtitle: 'Family, friends, mentors — anyone in your corner.',
        type: 'single',
        options: [
          'Yes',
          'Somewhat',
          'Not really',
          'Prefer not to say',
        ],
        allowSkip: true,
      },
      {
        id: 'has_caseworker',
        question: 'Are you working with a reentry counselor or case worker?',
        type: 'single',
        options: [
          'Yes',
          'No',
          'Not sure what that is',
        ],
        allowSkip: true,
      },
      {
        id: 'contact_preference',
        question: 'How would you prefer to get updates?',
        type: 'single',
        options: [
          'In the app',
          'Email',
          "Don't contact me",
        ],
        allowSkip: true,
      },
    ],
  },
];
