import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const { language, t } = useLanguage();
  const { items, removeFromCart, totalPrice } = useCart();

  const formatPrice = (rub: number, usd: number) => {
    return language === 'ru'
      ? `${rub.toLocaleString('ru-RU')} ₽`
      : `$${usd.toLocaleString('en-US')}`;
  };

  const totalUsd = items.reduce((sum, item) => sum + item.artwork.priceUsd, 0);

  if (items.length === 0) {
    return (
      <section className="py-20 md:py-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {t.cart.empty}
          </h1>
          <Link to="/gallery">
            <Button className="gap-2 uppercase tracking-widest">
              {t.cart.continueShopping}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-10">
            {t.cart.title}
          </h1>
        </motion.div>

        <div className="space-y-6 mb-10">
          {items.map((item, index) => {
            const title = language === 'ru' ? item.artwork.title : item.artwork.titleEn;
            return (
              <motion.div
                key={item.artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-4 border border-border rounded-sm"
              >
                <div className="w-24 h-32 bg-muted flex-shrink-0">
                  <img
                    src={item.artwork.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{item.artwork.dimensions}</p>
                  </div>
                  <p className="text-lg font-medium">
                    {formatPrice(item.artwork.price, item.artwork.priceUsd)}
                  </p>
                </div>

                <button
                  onClick={() => removeFromCart(item.artwork.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors self-start p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border-t border-border pt-6 space-y-4">
          <div className="flex justify-between text-lg">
            <span>{t.cart.total}</span>
            <span className="font-medium">{formatPrice(totalPrice, totalUsd)}</span>
          </div>
          
          <Link to="/checkout">
            <Button size="lg" className="w-full gap-2 uppercase tracking-widest">
              {t.cart.checkout}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link
            to="/gallery"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t.cart.continueShopping}
          </Link>
        </div>
      </div>
    </section>
  );
}
