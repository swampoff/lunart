import type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentProvider,
  WebhookEvent,
} from './provider.js';

/**
 * Заглушка платёжного провайдера для локальной разработки и тестов.
 * Вместо внешнего эквайринга отправляет гостя на страницу /pay/{paymentId},
 * где можно вручную подтвердить или отклонить оплату. Боевые ключи не нужны.
 */
export class MockProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      providerRef: `mock_${input.paymentId}`,
      status: 'pending',
      confirmationUrl: `/pay/${input.paymentId}`,
    };
  }

  parseWebhook(body: unknown): WebhookEvent | null {
    if (typeof body !== 'object' || body === null) return null;
    const { providerRef, status } = body as Record<string, unknown>;
    if (typeof providerRef !== 'string') return null;
    if (status !== 'succeeded' && status !== 'canceled' && status !== 'pending') return null;
    return { providerRef, status };
  }
}
