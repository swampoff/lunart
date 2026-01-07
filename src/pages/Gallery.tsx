import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { GalleryFilters } from '@/components/gallery/GalleryFilters';
import { mockArtworks } from '@/data/mockArtworks';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArtworkStyle, ArtworkSize } from '@/types/artwork';
import { motion } from 'framer-motion';

export default function Gallery() {
  const { t } = useLanguage();
  const [selectedStyle, setSelectedStyle] = useState<ArtworkStyle | 'all'>('all');
  const [selectedSize, setSelectedSize] = useState<ArtworkSize | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

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

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-8">
              {t.gallery.title}
            </h1>
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
              <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
            ))}
          </div>

          {filteredArtworks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No artworks found</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
