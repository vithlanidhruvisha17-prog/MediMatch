import dotenv from 'dotenv';
dotenv.config();

function resolveDatabaseUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let url = rawUrl.trim();
  // Automatically route Supabase direct IPv6 address through AWS Tokyo IPv4 pooler
  if (url.includes('db.rerirwnmepsybknizeyh.supabase.co')) {
    url = url
      .replace('db.rerirwnmepsybknizeyh.supabase.co:5432', 'aws-0-ap-northeast-1.pooler.supabase.com:5432')
      .replace('db.rerirwnmepsybknizeyh.supabase.co', 'aws-0-ap-northeast-1.pooler.supabase.com:5432');

    if (url.includes('://postgres:') && !url.includes('://postgres.rerirwnmepsybknizeyh:')) {
      url = url.replace('://postgres:', '://postgres.rerirwnmepsybknizeyh:');
    }
    if (url.includes('MediMatch@2026')) {
      url = url.replace('MediMatch@2026', 'MediMatch%402026');
    }
  }
  return url;
}

const resolvedDbUrl = resolveDatabaseUrl(process.env.DATABASE_URL || '');
if (resolvedDbUrl) {
  process.env.DATABASE_URL = resolvedDbUrl;
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: resolvedDbUrl,
  JWT_SECRET:
    process.env.JWT_SECRET ||
    (() => {
      throw new Error('Missing required env var JWT_SECRET');
    })(),
  ENCRYPTION_KEY:
    process.env.ENCRYPTION_KEY ||
    (() => {
      throw new Error('Missing required env var ENCRYPTION_KEY');
    })(),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM:
    process.env.EMAIL_FROM ||
    'MediMatch Health <notifications@medimatch.health>',
  ADMIN_NOTIFICATION_EMAIL:
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    'care-coordinator@medimatch.health',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
};
