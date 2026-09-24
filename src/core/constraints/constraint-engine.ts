import { CONSTRAINT_PROFILES, ConstraintProfile } from './profiles.js';

export interface ConstraintValidationResult {
  valid: boolean;
  errors: string[];
  metrics: {
    characterCount: number;
    maxCharacters: number;
    minCharacters: number;
    hashtagCount: number;
    minHashtags: number;
    maxHashtags: number;
    hashtagsFound: string[];
    detectedTone: string;
    violatesForbiddenPhrase: boolean;
  };
}

export class ConstraintEngine {
  public static extractHashtags(content: string): string[] {
    const matches = content.match(/#[a-zA-Z0-9_]+/g);
    if (!matches) return [];
    return Array.from(new Set(matches.map(h => h.trim().toLowerCase())));
  }

  public static validate(
    content: string,
    platform: string,
    options: { tone?: string; explicitHashtags?: string[] } = {}
  ): ConstraintValidationResult {
    const profile: ConstraintProfile | undefined = CONSTRAINT_PROFILES[platform.toLowerCase()];
    const errors: string[] = [];

    if (!profile) {
      return {
        valid: false,
        errors: [`Unknown platform '${platform}'. Configured platforms: ${Object.keys(CONSTRAINT_PROFILES).join(', ')}`],
        metrics: {
          characterCount: content.length,
          maxCharacters: 0,
          minCharacters: 0,
          hashtagCount: 0,
          minHashtags: 0,
          maxHashtags: 0,
          hashtagsFound: [],
          detectedTone: options.tone || 'unknown',
          violatesForbiddenPhrase: false,
        }
      };
    }

    const trimmed = content.trim();
    const characterCount = trimmed.length;

    if (characterCount < profile.minCharacters) {
      errors.push(
        `[Constraint Violation: Min Length] Content for platform '${profile.displayName}' is too short: ${characterCount} characters (minimum required is ${profile.minCharacters} characters).`
      );
    }
    if (characterCount > profile.maxCharacters) {
      errors.push(
        `[Constraint Violation: Max Length] Content for platform '${profile.displayName}' exceeds limit: ${characterCount} characters (maximum allowed is ${profile.maxCharacters} characters).`
      );
    }

    const foundHashtags = options.explicitHashtags && options.explicitHashtags.length > 0 
      ? options.explicitHashtags 
      : this.extractHashtags(trimmed);
    const hashtagCount = foundHashtags.length;

    if (hashtagCount < profile.minHashtags) {
      errors.push(
        `[Constraint Violation: Hashtag Count] Platform '${profile.displayName}' requires at least ${profile.minHashtags} hashtags, but found ${hashtagCount}.`
      );
    }
    if (hashtagCount > profile.maxHashtags) {
      errors.push(
        `[Constraint Violation: Hashtag Count] Platform '${profile.displayName}' allows at most ${profile.maxHashtags} hashtags, but found ${hashtagCount}.`
      );
    }

    let violatesForbiddenPhrase = false;
    if (profile.forbiddenPhrases && profile.forbiddenPhrases.length > 0) {
      for (const phrase of profile.forbiddenPhrases) {
        if (trimmed.toLowerCase().includes(phrase.toLowerCase())) {
          violatesForbiddenPhrase = true;
          errors.push(
            `[Constraint Violation: Forbidden Phrase] Content contains prohibited phrase '${phrase}' for platform '${profile.displayName}'.`
          );
        }
      }
    }

    const tone = options.tone ? options.tone.toLowerCase() : 'balanced';
    if (options.tone f& !profile.allowedTones.includes(tone) && tone !== 'balanced') {
      errors.push(
        `[Constraint Violation: Tone] Tone '${options.tone}' is not recommended for '${profile.displayName}'. Allowed tones: ${profile.allowedTones.join(', ')}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      metrics: {
        characterCount,
        maxCharacters: profile.maxCharacters,
        minCharacters: profile.minCharacters,
        hashtagCount,
        minHashtags: profile.minHashtags,
        maxHashtags: profile.maxHashtags,
        hashtagsFound: foundHashtags,
        detectedTone: tone,
        violatesForbiddenPhrase,
      }
    };
  }
}
