import { Artwork } from '@/types/artwork';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
  onClick?: () => void;
}

export function ArtworkCard({ artwork, index = 0, onClick }: ArtworkCardProps) {
  const { language, t } = useLanguage();
  const { addToCart, items } = useCart();

  const title = language === 'ru' ? artwork.title : artwork.titleEn;
  const price = language === 'ru' 
    ? `${artwork.price.toLocaleString('ru-RU')} ₽` 
    : `$${artwork.priceUsd.toLocaleString('en-US')}`;

  const isSold = artwork.status === 'sold';
  const isInCart = items.some(item => item.artwork.id === artwork.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-muted aspect-[3/4]">
        <img
          src={artwork.imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-medium backdrop-blur-sm ${
          isSold 
            ? 'bg-foreground/80 text-background' 
            : 'bg-background/90 text-foreground border border-border'
        }`}>
          {isSold ? t.gallery.sold : t.gallery.forSale}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
          <Link to={`/artwork/${artwork.id}`} onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 bg-background/80 backdrop-blur-sm border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">{t.gallery.viewDetails}</span>
            </Button>
          </Link>
          {!isSold && (
            <Button 
              size="sm" 
              className="gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(artwork);
              }}
              disabled={isInCart}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">
                {isInCart ? '✓' : t.gallery.addToCart}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-5 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-xl font-light tracking-tight group-hover:text-muted-foreground transition-colors">
            {title}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        </div>
        <p className="text-sm text-muted-foreground tracking-wide">{artwork.dimensions}</p>
        <p className="text-lg font-medium tracking-tight">{price}</p>
      </div>
    </motion.article>
  );
}
