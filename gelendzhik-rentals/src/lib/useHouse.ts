import { useEffect, useState } from 'react';
import { api, type HouseInfo } from '@/lib/api';

/**
 * Данные дома нужны почти на каждой странице (шапка, подвал, адрес),
 * но меняются редко — держим один общий запрос на всё приложение.
 */
let cache: HouseInfo | null = null;
let pending: Promise<HouseInfo> | null = null;
const subscribers = new Set<(house: HouseInfo) => void>();

export function useHouse(): HouseInfo | null {
  const [house, setHouse] = useState<HouseInfo | null>(cache);

  useEffect(() => {
    if (cache) return;

    subscribers.add(setHouse);
    pending ??= api.house().then((data) => {
      cache = data;
      subscribers.forEach((notify) => notify(data));
      return data;
    });

    return () => {
      subscribers.delete(setHouse);
    };
  }, []);

  return house;
}
