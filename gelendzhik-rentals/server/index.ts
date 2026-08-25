import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { expireStaleHolds } from './availability.js';
import { bookingsRouter } from './routes/bookings.js';
import { paymentsRouter } from './routes/payments.js';
import { apartmentsRouter } from './routes/apartments.js';
import { seed } from './seed.js';

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? (isProduction ? 3000 : 3001));

seed();

const app = express();
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: process.env.PAYMENT_PROVIDER ?? 'mock' });
});

app.use('/api', apartmentsRouter);
app.use('/api', bookingsRouter);
app.use('/api', paymentsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Метод не найден' });
});

// В production тот же процесс отдаёт собранный фронтенд; в dev этим занимается Vite.
const distPath = resolve(process.cwd(), 'dist');
if (isProduction && existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
  });
}

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[api]', error);
  res.status(500).json({
    error: 'internal_error',
    message: 'Что-то пошло не так. Попробуйте ещё раз или напишите нам в WhatsApp.',
  });
});

// Освобождаем даты неоплаченных броней, даже когда на сайте нет посетителей.
const holdSweeper = setInterval(() => {
  const released = expireStaleHolds();
  if (released > 0) console.log(`[holds] освобождено броней: ${released}`);
}, 60_000);
holdSweeper.unref();

app.listen(port, () => {
  console.log(`API слушает http://localhost:${port}`);
});
