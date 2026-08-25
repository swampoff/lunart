import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { BookingPage } from '@/pages/BookingPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { HomePage } from '@/pages/HomePage';
import { PayPage } from '@/pages/PayPage';
import { PropertyPage } from '@/pages/PropertyPage';

/** При переходе между страницами возвращаем прокрутку наверх. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-5xl font-extrabold text-sea-900">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">Страница не найдена</h1>
      <p className="mt-2 text-ink-soft">Возможно, объект снят с публикации или ссылка устарела.</p>
      <Link
        to="/catalog"
        className="mt-6 inline-block rounded-xl bg-sea-900 px-6 py-3 font-semibold text-white transition hover:bg-sea-700"
      >
        Смотреть квартиры
      </Link>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/apartment/:slug" element={<PropertyPage />} />
          <Route path="/checkout/:slug" element={<CheckoutPage />} />
          <Route path="/pay/:paymentId" element={<PayPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
