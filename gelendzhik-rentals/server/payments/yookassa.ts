import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  PaymentStatus,
  WebhookEvent,
} from './provider.js';

const API_URL = 'https://api.yookassa.ru/v3/payments';

/**
 * Боевой эквайринг ЮKassa.
 * Требует YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY из личного кабинета магазина.
 *
 * Схема: создаём платёж с capture=true (одностадийная оплата), отправляем гостя
 * на confirmation_url, а факт оплаты узнаём из webhook payment.succeeded —
 * возврат гостя на сайт не является подтверждением платежа.
 */
export class YooKassaProvider implements PaymentProvider {
  readonly name = 'yookassa';

  constructor(
    private readonly shopId: string,
    private readonly secretKey: string,
  ) {}

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64')}`;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader(),
        'Idempotence-Key': input.idempotenceKey,
      },
      body: JSON.stringify({
        amount: { value: input.amount.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: input.returnUrl },
        description: input.description,
        metadata: { bookingId: input.bookingId, paymentId: input.paymentId },
        receipt: {
          customer: { email: input.customerEmail, phone: input.customerPhone },
          items: [
            {
              description: input.description.slice(0, 128),
              quantity: '1.00',
              amount: { value: input.amount.toFixed(2), currency: 'RUB' },
              vat_code: 1, // без НДС; уточните код по своей системе налогообложения
              payment_mode: 'full_prepayment',
              payment_subject: 'service',
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`ЮKassa вернула ${response.status}: ${details}`);
    }

    const payment = (await response.json()) as {
      id: string;
      status: string;
      confirmation?: { confirmation_url?: string };
    };

    return {
      providerRef: payment.id,
      status: normalizeStatus(payment.status),
      confirmationUrl: payment.confirmation?.confirmation_url ?? null,
    };
  }

  parseWebhook(body: unknown): WebhookEvent | null {
    if (typeof body !== 'object' || body === null) return null;
    const notification = body as { event?: unknown; object?: { id?: unknown; status?: unknown } };
    if (typeof notification.event !== 'string') return null;
    if (!notification.event.startsWith('payment.')) return null;

    const id = notification.object?.id;
    const status = notification.object?.status;
    if (typeof id !== 'string' || typeof status !== 'string') return null;

    return { providerRef: id, status: normalizeStatus(status) };
  }
}

function normalizeStatus(status: string): PaymentStatus {
  if (status === 'succeeded') return 'succeeded';
  if (status === 'canceled') return 'canceled';
  return 'pending';
}
