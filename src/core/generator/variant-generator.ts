import { DatabaseSync } from 'node:sqlite';
import { v4 as uuidv4 } from 'uuid';
import { ConstraintEngine } from '../constraints/constraint-engine.js';
import { PlatformName } from '../constraints/profiles.js';
import { BlogPost } from '../ingestion/post-ingestion.js';

export interface GeneratedVariant {
  id: string;
  postId: string;
  platform: PlatformName;
  content: string;
  hashtags: string[];
  characterCount: number;
  status: 'draft' | 'approved' | 'rejected' | 'published';
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationOptions {
  tone?: string;
  platforms?: PlatformName[];
  customKeywords?: string[];
}

export class VariantGenerator {
  private constraintEngine: ConstraintEngine;

  constructor(private db: DatabaseSync) {
    this.constraintEngine = new ConstraintEngine();
  }

  async generateVariantsForPost(
    postId: string,
    options: GenerationOptions = {}
  ): Promise<GeneratedVariant[]> {
    const postStmt = this.db.prepare('SELECT * FROM posts WHERE id = ?');
    const postRow = postStmt.get(postId) as any;

    if (!postRow) {
      throw new Error(`Cannot generate variants: Post with ID "${postId}" not found in database.`);
    }

    const post: BlogPost = {
      id: postRow.id,
      title: postRow.title,
      content: postRow.content,
      sourceUrl: postRow.source_url || undefined,
      author: postRow.author,
      createdAt: postRow.created_at,
      updatedAt: postRow.updated_at,
    };

    const targetPlatforms: PlatformName[] = options.platforms || [
      'x',
      'linkedin',
      'instagram',
      'telegram',
      'discord',
    ];

    const generated: GeneratedVariant[] = [];

    for (const platform of targetPlatforms) {
      const variant = this.createPlatformVariant(post, platform, options);
      
      const validation = this.constraintEngine.validate(platform, variant.content);
      if (!validation.valid) {
        throw new Error(
          `Generated variant for platform "${platform}" violates constraint profile: ${validation.errors.join('; ')}`
        );
      }

      const id = uuidv4();
      const now = new Date().toISOString();
      const hashtagsJson = JSON.stringify(validation.metrics.hashtags);

      const insertStmt = this.db.prepare(`
        INSERT INTO variants (id, post_id, platform, content, hashtags, character_count, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)
      `);

      insertStmt.run(
        id,
        post.id,
        platform,
        variant.content,
        hashtagsJson,
        validation.metrics.characterCount,
        now,
        now
      );

      generated.push({
        id,
        postId: post.id,
        platform,
        content: variant.content,
        hashtags: validation.metrics.hashtags,
        characterCount: validation.metrics.characterCount,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      });
    }

    return generated;
  }

  private createPlatformVariant(
    post: BlogPost,
    platform: PlatformName,
    options: GenerationOptions
  ): { content: string; hashtags: string[] } {
    const keyPoints = this.extractKeyPoints(post.content);
    const keywords = this.extractKeywords(post.title, post.content, options.customKeywords);

    switch (platform) {
      case 'x': {
        const tags = keywords.slice(0, 2).map(k => `#${k}`).join(' ');
        const lead = post.title.length > 90 ? post.title.slice(0, 87) + '...' : post.title;
        const mainPoint = keyPoints[0] || 'Key takeaway for engineering teams building resilient systems.';
        
        let body = `🚀 ${lead}\n\n💡 ${mainPoint}`;
        if ((body + `\n\n${tags}`).length > 275) {
          const budget = 270 - tags.length - 8;
          body = body.slice(0, Math.max(20, budget)) + '...';
        }
        const fullContent = `${body}\n\n${tags}`.trim();
        return { content: fullContent, hashtags: keywords.slice(0, 2) };
      }

      case 'linkedin': {
        const tags = keywords.slice(0, 4).map(k => `#${k}`).join(' ');
        const bullets = keyPoints.slice(0, 3).map((pt) => `🔹 ${pt}`).join('\n');
        
        const content = [
          `📢 ${post.title}`,
          '',
          'In modern distributed architectures, reliability and operational precision determine scale.',
          '',
          'Key Insights & Implementation Takeaways:',
          bullets,
          '',
          "What are your team's best practices for ensuring idempotent publishing workflows?",
          '',
          tags,
        ].join('\n');

        return { content, hashtags: keywords.slice(0, 4) };
      }

      case 'instagram': {
        const tags = keywords.slice(0, 7).map(k => `#${k}`).join(' ');
        const content = [
          `✈ ${post.title.toUpperCase()}`,
          '• • •',
          keyPoints[0] || 'Breaking down the core principles of durable systems.',
          '',
          '📌 Save this post for your next architectural deep dive!',
          '👇 Share your thoughts in the comments.',
          '• • •',
          tags,
        ].join('\n');

        return { content, hashtags: keywords.slice(0, 7) };
      }

      case 'telegram': {
        const tags = keywords.slice(0, 3).map(k => `#${k}`).join(' ');
        const bullets = keyPoints.slice(0, 2).map(pt => `• ${pt}`).join('\n');
        const urlPart = post.sourceUrl ? ': ' + post.sourceUrl : '';
        
        const content = [
          `⚡️ *${post.title}*`,
          '',
          'Fresh technical breakdown from the team:',
          bullets,
          '',
          `🔗 Read the full post${urlPart}`,
          '',
          tags,
        ].join('\n');

        return { content, hashtags: keywords.slice(0, 3) };
      }

      case 'discord': {
        const tags = keywords.slice(0, 3).map(k => `#${k}`).join(' ');
        const bullets = keyPoints.slice(0, 3).map(pt => `> ⚡️ **${pt}**`).join('\n');
        
        const content = [
          `### 🌐 New Post Alert: **${post.title}**`,
          '',
          bullets,
          '',
          "React with 🔥 if you're implementing this pattern in your stack!",
          '',
          tags,
        ].join('\n');

        return { content, hashtags: keywords.slice(0, 3) };
      }
    }
  }

  private extractKeyPoints(content: string): string[] {
    const clean = content.replace(/#+ /g, '').replace(/[*_`]/g, '');
    const sentences = clean
      .split(/[.\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && s.length < 160);

    if (sentences.length === 0) {
      return [
        'Idempotency prevents duplicate operations under network retries.',
        'Decoupled publisher adapters isolate platform-specific APIs from core business logic.',
        'Durable job queues guarantee safe batch processing and worker crash recovery.',
      ];
    }

    return sentences.slice(0, 4);
  }

  private extractKeywords(title: string, content: string, custom?: string[]): string[] {
    const defaultPool = ['Engineering', 'Architecture', 'TechLead', 'SoftwareDesign', 'DevOps', 'Cloud', 'SystemDesign'];
    if (custom && custom.length > 0) {
      return [...new Set([...custom, ...defaultPool])];
    }
    const words = `${title} ${content}`
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['about', 'after', 'before', 'their', 'which', 'would', 'could', 'should'].includes(w.toLowerCase()));

    const uniqueWords = [...new Set(words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))];
    return uniqueWords.length >= 5 ? uniqueWords.slice(0, 10) : defaultPool;
  }
}
