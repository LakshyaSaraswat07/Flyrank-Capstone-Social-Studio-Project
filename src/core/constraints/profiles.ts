export interface ConstraintProfile {
  platform: 'x' | 'linkedin' | 'instagram' | 'telegram' | 'discord';
  displayName: string;
  maxCharacters: number;
  minCharacters: number;
  minHashtags: number;
  maxHashtags: number;
  allowedTones: string[];
  forbiddenPhrases?: string[];
  formattingRules: {
    allowsMarkdown: boolean;
    allowsHtml: boolean;
    allowsHashtags: boolean;
  };
}

export const CONSTRAINT_PROFILES: Record<string, ConstraintProfile> = {
  x: {
    platform: 'x',
    displayName: 'X (Twitter)',
    maxCharacters: 280,
    minCharacters: 10,
    minHashtags: 1,
    maxHashtags: 3,
    allowedTones: ['punchy', 'direct', 'concise', 'engaging'],
    forbiddenPhrases: ['click here now', 'buy now spam', 'guaranteed rich'],
    formattingRules: { allowsMarkdown: false, allowsHtml: false, allowsHashtags: true }
  },
  linkedin: {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    maxCharacters: 3000,
    minCharacters: 80,
    minHashtags: 2,
    maxHashtags: 5,
    allowedTones: ['professional', 'thought-leadership', 'insightful', 'educational'],
    forbiddenPhrases: ['get rich quick', 'instant crypto pump'],
    formattingRules: { allowsMarkdown: true, allowsHtml: false, allowsHashtags: true }
  },
  instagram: {
    platform: 'instagram',
    displayName: 'Instagram',
    maxCharacters: 2200,
    minCharacters: 20,
    minHashtags: 5,
    maxHashtags: 15,
    allowedTones: ['visual', 'engaging', 'conversational', 'lifestyle'],
    forbiddenPhrases: ['follow for follow back', 'dm for credit'],
    formattingRules: { allowsMarkdown: false, allowsHtml: false, allowsHashtags: true }
  },
  telegram: {
    platform: 'telegram',
    displayName: 'Telegram Channel',
    maxCharacters: 4096,
    minCharacters: 10,
    minHashtags: 0,
    maxHashtags: 5,
    allowedTones: ['informative', 'direct', 'announcement', 'community'],
    forbiddenPhrases: [],
    formattingRules: { allowsMarkdown: true, allowsHtml: true, allowsHashtags: true }
  },
  discord: {
    platform: 'discord',
    displayName: 'Discord Channel',
    maxCharacters: 2000,
    minCharacters: 5,
    minHashtags: 0,
    maxHashtags: 3,
    allowedTones: ['casual', 'collaborative', 'community', 'punchy'],
    forbiddenPhrases: [],
    formattingRules: { allowsMarkdown: true, allowsHtml: false, allowsHashtags: true }
  }
};
