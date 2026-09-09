import { apiClient } from '../api/client';

export interface CreateOrderPayload {
  type: 'CONSULTATION' | 'PACKAGE_ADVANCE';
  doctorId?: string;
  inquiryId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsApi = {
  createOrder: async (data: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const response = await apiClient.post('/payments/create-order', data);
    return response.data;
  },

  verifyPayment: async (data: VerifyPaymentPayload): Promise<{ success: boolean; status?: string }> => {
    const response = await apiClient.post('/payments/verify', data);
    return response.data;
  },
};
