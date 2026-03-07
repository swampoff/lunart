import { useState, useCallback } from 'react';
import { Artwork } from '@/types/artwork';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface GallerySliderProps {
  artworks: Artwork[];
  onClose: () => void;
  initialIndex?: number;
}

export function GallerySlider({ artworks, onClose, initialIndex = 0 }: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const { language, t } = useLanguage();
  const { addToCart, items } = useCart();

  const artwork = artworks[currentIndex];
  const title = language === 'ru' ? artwork.title : artwork.titleEn;
  const description = language === 'ru' ? artwork.description : artwork.descriptionEn;
  const price = language === 'ru' 
    ? `${artwork.price.toLocaleString('ru-RU')} ₽` 
    : `$${artwork.priceUsd.toLocaleString('en-US')}`;

  const isSold = artwork.status === 'sold';
  const isInCart = items.some(item => item.artwork.id === artwork.id);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? artworks.length - 1 : prev - 1));
  }, [artworks.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === artworks.length - 1 ? 0 : prev + 1));
  }, [artworks.length]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background backdrop-blur-sm overflow-hidden"
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 z-50 h-12 w-12"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 h-14 w-14"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Content */}
      <div className="h-full flex flex-col lg:flex-row items-center justify-center p-8 lg:p-16 gap-8 lg:gap-16">
        {/* Image */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-[80vh] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={currentIndex}
              src={artwork.imageUrl}
              alt={title}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </AnimatePresence>
        </div>

        {/* Info Panel */}
        <motion.div 
          key={`info-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-1/3 space-y-6"
        >
          <div className={`inline-block px-3 py-1.5 text-xs uppercase tracking-widest font-semibold backdrop-blur-md ${
            isSold ? 'bg-foreground/90 text-primary-foreground' : 'bg-background/95 text-foreground border border-border shadow-sm'
          }`}>
            {isSold ? t.gallery.sold : t.gallery.forSale}
          </div>

          <h2 className="font-serif text-3xl lg:text-4xl">{title}</h2>
          
          <div className="space-y-2 text-muted-foreground">
            <p>{artwork.dimensions}</p>
            <p>{artwork.medium}</p>
            <p>{artwork.year}</p>
          </div>

          <p className="text-lg leading-relaxed">{description}</p>

          <p className="text-2xl font-medium">{price}</p>

          <div className="flex gap-4 pt-4">
            <Link to={`/artwork/${artwork.id}`}>
              <Button variant="outline" size="lg" className="gap-2">
                <Eye className="w-5 h-5" />
                {t.gallery.viewDetails}
              </Button>
            </Link>
            {!isSold && (
              <Button 
                size="lg" 
                className="gap-2"
                onClick={() => addToCart(artwork)}
                disabled={isInCart}
              >
                <ShoppingBag className="w-5 h-5" />
                {isInCart ? '✓' : t.gallery.addToCart}
              </Button>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex gap-2 pt-6">
            {artworks.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-foreground w-8' 
                    : 'bg-foreground/30 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Keyboard Navigation */}
      <KeyboardHandler onLeft={goToPrevious} onRight={goToNext} onEsc={onClose} />
    </motion.div>
  );
}

import { useEffect } from 'react';

function KeyboardHandler({ 
  onLeft, 
  onRight, 
  onEsc 
}: { 
  onLeft: () => void; 
  onRight: () => void; 
  onEsc: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onLeft();
      if (e.key === 'ArrowRight') onRight();
      if (e.key === 'Escape') onEsc();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLeft, onRight, onEsc]);
  
  return null;
}
