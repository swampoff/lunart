import { useState, useMemo } from 'react';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { GalleryFilters } from '@/components/gallery/GalleryFilters';
import { GallerySlider } from '@/components/gallery/GallerySlider';
import { mockArtworks } from '@/data/mockArtworks';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArtworkStyle, ArtworkSize } from '@/types/artwork';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedStyle, setSelectedStyle] = useState<ArtworkStyle | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<ArtworkSize | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  const filteredArtworks = useMemo(() => {
    let result = [...mockArtworks];

    if (selectedStyle !== 'all') {
      result = result.filter(a => a.style === selectedStyle);
    }

    if (selectedSize !== 'all') {
      result = result.filter(a => a.size === selectedSize);
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [selectedStyle, selectedSize, sortBy]);

  const openSlider = (index: number) => {
    setSliderIndex(index);
    setSliderOpen(true);
  };

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              {t.gallery.title}
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openSlider(0)}
              className="gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              {t.gallery.viewSlider}
            </Button>
          </motion.div>

          <GalleryFilters
            selectedStyle={selectedStyle}
            selectedSize={selectedSize}
            sortBy={sortBy}
            onStyleChange={setSelectedStyle}
            onSizeChange={setSelectedSize}
            onSortChange={setSortBy}
          />

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((artwork, index) => (
              <div key={artwork.id} onClick={() => openSlider(index)} className="cursor-pointer">
                <ArtworkCard artwork={artwork} index={index} />
              </div>
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t.gallery.noArtworks}</p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {sliderOpen && (
          <GallerySlider
            artworks={filteredArtworks}
            initialIndex={sliderIndex}
            onClose={() => setSliderOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
