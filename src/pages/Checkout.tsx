import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Bitcoin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { language, t } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'installment'>('card');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const totalUsd = items.reduce((sum, item) => sum + item.artwork.priceUsd, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t.checkout.orderPlaced);
    clearCart();
    navigate('/');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-10">
            {t.checkout.title}
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-12">
          {/* Shipping Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-medium">{t.checkout.shippingInfo}</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.checkout.name}</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">{t.checkout.email}</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">{t.checkout.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">{t.checkout.address}</Label>
                <Input
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">{t.checkout.city}</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">{t.checkout.postalCode}</Label>
                  <Input
                    id="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">{t.checkout.country}</Label>
                <Input
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-medium">{t.checkout.paymentMethod}</h2>
              
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 border border-border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5" />
                    {t.checkout.card}
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="crypto" id="crypto" />
                  <Label htmlFor="crypto" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Bitcoin className="w-5 h-5" />
                    {t.checkout.crypto}
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="installment" id="installment" />
                  <Label htmlFor="installment" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Calendar className="w-5 h-5" />
                    {t.checkout.installment}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Order Summary */}
            <div className="border border-border rounded-sm p-6 space-y-4">
              <h3 className="font-medium">{t.checkout.orderSummary}</h3>
              
              {items.map((item) => {
                const title = language === 'ru' ? item.artwork.title : item.artwork.titleEn;
                const price = language === 'ru'
                  ? `${item.artwork.price.toLocaleString('ru-RU')} ₽`
                  : `$${item.artwork.priceUsd.toLocaleString('en-US')}`;
                return (
                  <div key={item.artwork.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{title}</span>
                    <span>{price}</span>
                  </div>
                );
              })}

              <div className="border-t border-border pt-4 flex justify-between text-lg font-medium">
                <span>{t.cart.total}</span>
                <span>
                  {language === 'ru'
                    ? `${totalPrice.toLocaleString('ru-RU')} ₽`
                    : `$${totalUsd.toLocaleString('en-US')}`}
                </span>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full uppercase tracking-widest">
              {t.checkout.placeOrder}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
