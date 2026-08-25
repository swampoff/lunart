import type { Response } from 'express';
import { z } from 'zod';

/** Дата в формате YYYY-MM-DD, обязательно существующая в календаре. */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Такой даты не существует');

export function validationError(res: Response, error: z.ZodError): Response {
  const first = error.errors[0];
  return res.status(400).json({
    error: 'validation_error',
    message: first?.message ?? 'Проверьте правильность заполнения полей',
    details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
  });
}
