export type PaymentStatus = 'pending' | 'succeeded' | 'canceled';

export interface CreatePaymentInput {
  paymentId: string;
  bookingId: string;
  /** Сумма в рублях. */
  amount: number;
  description: string;
  /** Куда провайдер вернёт гостя после оплаты. */
  returnUrl: string;
  /** Защищает от двойного списания при повторной отправке запроса. */
  idempotenceKey: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CreatePaymentResult {
  providerRef: string;
  status: PaymentStatus;
  /** Страница оплаты, куда нужно отправить гостя. */
  confirmationUrl: string | null;
}

export interface WebhookEvent {
  providerRef: string;
  status: PaymentStatus;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /** Возвращает null, если уведомление не относится к смене статуса платежа. */
  parseWebhook(body: unknown): WebhookEvent | null;
}
