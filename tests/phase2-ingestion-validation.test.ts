import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../src/database/db.js';
import { PostIngestionService } from '../src/core/ingestion/post-ingestion.js';
import { VariantGenerator } from '../src/core/generator/variant-generator.js';
import { ConstraintEngine } from '../src/core/constraints/constraint-engine.js';
import { DatabaseSync } from 'node:sqlite';

describe('Phase 2: Post Ingestion and Constraint Validation', () => {
  let db: DatabaseSync;
  let ingestionService: PostIngestionService;
  let generator: VariantGenerator;
  let constraintEngine: ConstraintEngine;

  beforeEach(() => {
    db = createTestDatabase();
    ingestionService = new PostIngestionService(db);
    generator = new VariantGenerator(db);
    constraintEngine = new ConstraintEngine();
  });

  it('PROBE 1 - Ingests a sample post, generates platform variants, and each passes constraint profile', async () => {
    const samplePost = await ingestionService.ingestPost({
      title: 'Mastering Idempotent API Publishing at Scale',
      content: `
# Mastering Idempotent API Publishing at Scale

Publishing updates across distributed social platforms requires strict reliability engineering.
A network timeout during a POST request leaves the client in an indeterminate state.
By enforcing unique idempotency keys per target slot, duplicate posts are completely eliminated.
Decoupling delivery adapters ensures seamless platform extensions without rewriting core publishing logic.
      `.trim(),
      author: 'Backend Team',
    });

    expect(samplePost.id).toBeDefined();
    expect(samplePost.title).toBe('Mastering Idempotent API Publishing at Scale');

    const variants = await generator.generateVariantsForPost(samplePost.id, {
      platforms: ['x', 'linkedin', 'instagram', 'telegram', 'discord'],
    });

    expect(variants.length).toBe(5);

    for (const variant of variants) {
      expect(variant.status).toBe('draft');
      expect(variant.content.length).toBeGreaterThan(0);

      const validation = constraintEngine.validate(variant.platform, variant.content);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      if (variant.platform === 'x') {
        expect(variant.content.length).toBeLessThanOrEqual(280);
        expect(validation.metrics.hashtagCount).toBeLessThanOrEqual(2);
      }
      if (variant.platform === 'linkedin') {
        expect(variant.content.length).toBeGreaterThanOrEqual(100);
        expect(variant.content.length).toBeLessThanOrEqual(3000);
        expect(validation.metrics.hashtagCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('PROBE 2 - Blocks a rule-breaking variant with an error message that explicitly names the broken rule', () => {
    const overlyLongTweet = 'A'.repeat(281) + ' #Tech';
    const xResult = constraintEngine.validate('x', overlyLongTweet);
    expect(xResult.valid).toBe(false);
    expect(xResult.errors.some(err => err.includes('exceeds maximum allowed length of 280 characters'))).toBe(true);

    const tooManyHashtagsTweet = 'Great update! #Tech #Coding #Engineering #Backend';
    const hashtagResult = constraintEngine.validate('x', tooManyHashtagsTweet);
    expect(hashtagResult.valid).toBe(false);
    expect(hashtagResult.errors.some(err => err.includes('exceeds maximum allowed of 2'))).toBe(true);

    const forbiddenPhrasePost = 'Here is our latest article! Click the link in bio for free crypto prize! #Tech #Dev';
    const forbiddenResult = constraintEngine.validate('x', forbiddenPhrasePost);
    expect(forbiddenResult.valid).toBe(false);
    expect(forbiddenResult.errors.some(err => err.includes('Forbidden phrase detected'))).toBe(true);

    const tooShortLinkedIn = 'Short post #Tech #Dev';
    const linkedInResult = constraintEngine.validate('linkedin', tooShortLinkedIn);
    expect(linkedInResult.valid).toBe(false);
    expect(linkedInResult.errors.some(err => err.includes('below minimum required length of 100 characters'))).toBe(true);
  });

  it('Enforces database persistence and retrieves the canonical stored post', async () => {
    const post = await ingestionService.ingestPost({
      title: 'Canonical Architecture',
      content: '# Canonical Architecture\n\nSingle source of truth pattern.',
    });

    const retrieved = ingestionService.getPost(post.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(post.id);
    expect(retrieved?.title).toBe('Canonical Architecture');
  });
});
