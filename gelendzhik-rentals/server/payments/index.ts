import { MockProvider } from './mock.js';
import type { PaymentProvider } from './provider.js';
import { YooKassaProvider } from './yookassa.js';

let provider: PaymentProvider | null = null;

/**
 * Провайдер выбирается переменной PAYMENT_PROVIDER.
 * Без боевых ключей ЮKassa сайт остаётся работоспособным на моке —
 * подставить реальный эквайринг можно, не меняя код бронирования.
 */
export function paymentProvider(): PaymentProvider {
  if (provider) return provider;

  const name = process.env.PAYMENT_PROVIDER ?? 'mock';

  if (name === 'yookassa') {
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      throw new Error(
        'PAYMENT_PROVIDER=yookassa требует YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в окружении',
      );
    }
    provider = new YooKassaProvider(shopId, secretKey);
  } else {
    provider = new MockProvider();
  }

  return provider;
}

export type { PaymentProvider } from './provider.js';
