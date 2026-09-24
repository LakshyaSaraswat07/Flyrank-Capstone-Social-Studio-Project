import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  appUrl: string;
  databasePath: string;
  defaultPublisherAdapter: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  aiProvider: 'template' | 'gemini' | 'ollama';
  geminiApiKey?: string;
  ollamaBaseUrl: string;
  schedulerPollIntervalMs: number;
  schedulerLockTimeoutSeconds: number;
  maxPublishRetries: number;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'social_studio.db'),
  defaultPublisherAdapter: process.env.DEFAULT_PUBLISHER_ADAPTER || 'mock_x',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  aiProvider: (process.env.AI_PROVIDER as any) || 'template',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  schedulerPollIntervalMs: parseInt(process.env.SCHEDULER_POLL_INTERVAL_MS || '3000', 10),
  schedulerLockTimeoutSeconds: parseInt(process.env.SCHEDULER_LOCK_TIMEOUT_SECONDS || '60', 10),
  maxPublishRetries: parseInt(process.env.MAX_PUBLISH_RETRIES || '3', 10),
};
