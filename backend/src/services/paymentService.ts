import { v4 as uuidv4 } from 'uuid';

export interface PaymentRequest {
  amount: number;
  worker_id: string;
  claim_id: string;
  method: 'upi' | 'bank_transfer';
}

export interface PaymentResult {
  success: boolean;
  transaction_ref: string | null;
  error?: string;
}

// Configurable failure rate for the mock payment gateway (0–1).
// Set MOCK_PAYMENT_FAILURE_RATE=0 in .env to disable failures during testing.
const MOCK_PAYMENT_FAILURE_RATE = parseFloat(process.env['MOCK_PAYMENT_FAILURE_RATE'] ?? '0.02');

export async function processPayment(request: PaymentRequest): Promise<PaymentResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));

  // Simulate occasional gateway failures for realism
  const shouldFail = Math.random() < MOCK_PAYMENT_FAILURE_RATE;

  if (shouldFail) {
    return {
      success: false,
      transaction_ref: null,
      error: 'Payment gateway timeout — please retry',
    };
  }

  const prefix = request.method === 'upi' ? 'UPI' : 'NEFT';
  const transaction_ref = `${prefix}-QSHIELD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

  return {
    success: true,
    transaction_ref,
  };
}
