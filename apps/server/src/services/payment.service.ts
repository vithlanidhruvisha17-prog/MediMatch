import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env';

class PaymentService {
  private client: Razorpay | null = null;
  public isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(ENV.RAZORPAY_KEY_ID && ENV.RAZORPAY_KEY_SECRET);
    if (this.isConfigured) {
      this.client = new Razorpay({ key_id: ENV.RAZORPAY_KEY_ID, key_secret: ENV.RAZORPAY_KEY_SECRET });
      console.log('[PAYMENT] Razorpay client initialized');
    } else {
      console.log('[PAYMENT] DEV MODE — Razorpay keys missing, payments disabled');
    }
  }

  async createOrder(amountPaise: number, receipt: string) {
    if (!this.client) throw new Error('Razorpay not configured');
    return this.client.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    });
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }
}

export const paymentService = new PaymentService();

