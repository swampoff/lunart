import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { addToCart, items } = useCart();

  const { data: artwork, isLoading } = useQuery({
    queryKey: ['artwork', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">{t.artworkDetail.artworkNotFound}</p>
      </div>
    );
  }

  const title = language === 'ru' ? artwork.title : artwork.title_en;
  const description = language === 'ru' ? (artwork.description || '') : (artwork.description_en || '');
  const price = language === 'ru'
    ? `${artwork.price.toLocaleString('ru-RU')} ₽`
    : `$${artwork.price_usd.toLocaleString('en-US')}`;

  const isSold = artwork.status === 'sold';
  const isInCart = items.some(item => item.artwork.id === artwork.id);

  // Map DB row to cart-compatible artwork object
  const cartArtwork = {
    id: artwork.id,
    title: artwork.title,
    titleEn: artwork.title_en,
    description: artwork.description || '',
    descriptionEn: artwork.description_en || '',
    price: artwork.price,
    priceUsd: artwork.price_usd,
    style: 'modern' as const,
    size: 'large' as const,
    dimensions: artwork.dimensions,
    medium: artwork.medium || '',
    imageUrl: artwork.image_url,
    status: artwork.status as 'for_sale' | 'sold',
    createdAt: artwork.created_at,
    year: artwork.year || 2024,
  };

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/gallery"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.nav.gallery}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <img
                src={artwork.image_url}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-4 left-4 px-3 py-1.5 text-xs uppercase tracking-widest font-semibold backdrop-blur-md ${
                isSold ? 'bg-foreground/90 text-primary-foreground' : 'bg-background/95 text-foreground border border-border shadow-sm'
              }`}>
                {isSold ? t.gallery.sold : t.gallery.forSale}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              {title}
            </h1>
            
            <p className="text-3xl font-medium mb-6">
              {price}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-muted-foreground">{t.gallery.filterSize}</span>
                <span>{artwork.dimensions}</span>
              </div>
              {artwork.medium && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t.gallery.filterStyle}</span>
                  <span>{language === 'ru' ? artwork.medium : (artwork.medium_en || artwork.medium)}</span>
                </div>
              )}
              {artwork.year && (
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">{t.common.year}</span>
                  <span>{artwork.year}</span>
                </div>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8 whitespace-pre-line">
              {description}
            </p>

            {!isSold && (
              <Button
                size="lg"
                className="w-full gap-2 uppercase tracking-widest"
                onClick={() => addToCart(cartArtwork)}
                disabled={isInCart}
              >
                <ShoppingBag className="w-5 h-5" />
                {isInCart ? `✓ ${t.common.addedToCart}` : t.gallery.addToCart}
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
