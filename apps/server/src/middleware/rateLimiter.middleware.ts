import rateLimit from 'express-rate-limit';

// 1. General API rate limiter (120 requests / minute per IP)
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' }
});

// 2. Authentication rate limiter (15 attempts / 15 minutes per IP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

// 3. AI Predict & Chat rate limiter (25 requests / 10 minutes per IP)
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI processing rate limit reached. Please wait a few minutes before submitting again.' }
});

// 4. Booking & Inquiries rate limiter (30 requests / 10 minutes per IP)
export const bookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many booking inquiries submitted. Please try again shortly.' }
});

// 5. Database Seed rate limiter (5 requests / 15 minutes per IP)
export const seedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Database seeding rate limit reached. Please wait.' }
});

// 6. Payment rate limiter (20 requests / 15 minutes per IP)
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment attempts. Please try again shortly.' }
});
