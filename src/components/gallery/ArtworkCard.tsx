import { Artwork } from '@/types/artwork';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
}

export function ArtworkCard({ artwork, index = 0 }: ArtworkCardProps) {
  const { language, t } = useLanguage();
  const { addToCart, items } = useCart();

  const title = language === 'ru' ? artwork.title : artwork.titleEn;
  const price = language === 'ru' 
    ? `${artwork.price.toLocaleString('ru-RU')} ₽` 
    : `$${artwork.priceUsd.toLocaleString('en-US')}`;

  const isSold = artwork.status === 'sold';
  const isInCart = items.some(item => item.artwork.id === artwork.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="artwork-card group"
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4] rounded-sm">
        <img
          src={artwork.imageUrl}
          alt={title}
          className="artwork-image w-full h-full object-cover transition-transform duration-700"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 text-xs uppercase tracking-widest font-medium ${
          isSold ? 'status-sold' : 'status-for-sale'
        }`}>
          {isSold ? t.gallery.sold : t.gallery.forSale}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link to={`/artwork/${artwork.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              {t.gallery.viewDetails}
            </Button>
          </Link>
          {!isSold && (
            <Button 
              size="sm" 
              className="gap-2"
              onClick={(e) => {
                e.preventDefault();
                addToCart(artwork);
              }}
              disabled={isInCart}
            >
              <ShoppingBag className="w-4 h-4" />
              {isInCart ? '✓' : t.gallery.addToCart}
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <h3 className="font-serif text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{artwork.dimensions}</p>
        <p className="text-lg font-medium">{price}</p>
      </div>
    </motion.div>
  );
}
