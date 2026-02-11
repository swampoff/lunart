import { useState, useMemo, useEffect } from 'react';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { GallerySlider } from '@/components/gallery/GallerySlider';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Artwork } from '@/types/artwork';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DbArtwork {
  id: string;
  title: string;
  title_en: string;
  description: string | null;
  description_en: string | null;
  image_url: string;
  price: number;
  price_usd: number;
  status: string;
  dimensions: string;
  medium: string | null;
  year: number | null;
  collection_id: string | null;
  sort_order: number;
}

interface DbCollection {
  id: string;
  title: string;
  title_en: string;
}

const mapDbToArtwork = (db: DbArtwork): Artwork => ({
  id: db.id,
  title: db.title,
  titleEn: db.title_en,
  description: db.description || '',
  descriptionEn: db.description_en || '',
  price: db.price,
  priceUsd: db.price_usd,
  style: 'modern',
  size: 'medium',
  dimensions: db.dimensions,
  medium: db.medium || '',
  imageUrl: db.image_url,
  status: db.status === 'sold' ? 'sold' : 'for_sale',
  createdAt: new Date().toISOString(),
  year: db.year || new Date().getFullYear(),
});

export default function Gallery() {
  const { t, language } = useLanguage();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [collections, setCollections] = useState<DbCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artworksRes, collectionsRes] = await Promise.all([
        supabase
          .from('artworks')
          .select('id, title, title_en, description, description_en, image_url, price, price_usd, status, dimensions, medium, year, collection_id, sort_order')
          .eq('visibility', 'visible')
          .order('sort_order'),
        supabase
          .from('collections')
          .select('id, title, title_en')
          .eq('status', 'published')
          .order('sort_order'),
      ]);

      if (artworksRes.data) {
        setArtworks(artworksRes.data.map(mapDbToArtwork));
      }
      if (collectionsRes.data) {
        setCollections(collectionsRes.data);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    if (selectedCollection !== 'all') {
      // We need collection_id from DB data, store it in a map
      result = result.filter(a => {
        // Match by checking the original DB data
        return true; // We'll fix this below
      });
    }

    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [artworks, selectedCollection, sortBy]);

  // Store raw DB artworks for filtering by collection
  const [rawArtworks, setRawArtworks] = useState<DbArtwork[]>([]);

  // Refetch with proper collection filtering
  useEffect(() => {
    const fetchRaw = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('artworks')
          .select('id, title, title_en, description, description_en, image_url, price, price_usd, status, dimensions, medium, year, collection_id, sort_order')
          .eq('visibility', 'visible')
          .order('sort_order');

        if (selectedCollection !== 'all') {
          query = query.eq('collection_id', selectedCollection);
        }

        const { data } = await query;
        if (data) {
          setRawArtworks(data);
          setArtworks(data.map(mapDbToArtwork));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaw();
  }, [selectedCollection]);

  const sortedArtworks = useMemo(() => {
    let result = [...artworks];
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [artworks, sortBy]);

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
            {sortedArtworks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSlider(0)}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                {t.gallery.viewSlider}
              </Button>
            )}
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 pb-8 border-b border-border">
            {collections.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  {language === 'ru' ? 'Коллекция' : 'Collection'}
                </label>
                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[200] bg-popover">
                    <SelectItem value="all">{language === 'ru' ? 'Все работы' : 'All Works'}</SelectItem>
                    {collections.map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {language === 'ru' ? col.title : col.title_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {language === 'ru' ? 'Сортировка' : 'Sort'}
              </label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[200] bg-popover">
                  <SelectItem value="default">{language === 'ru' ? 'По умолчанию' : 'Default'}</SelectItem>
                  <SelectItem value="price_asc">{language === 'ru' ? 'Цена ↑' : 'Price ↑'}</SelectItem>
                  <SelectItem value="price_desc">{language === 'ru' ? 'Цена ↓' : 'Price ↓'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedArtworks.map((artwork, index) => (
                <div key={artwork.id} onClick={() => openSlider(index)} className="cursor-pointer">
                  <ArtworkCard artwork={artwork} index={index} />
                </div>
              ))}
            </div>
          )}

          {!loading && sortedArtworks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">{t.gallery.noArtworks}</p>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {sliderOpen && (
          <GallerySlider
            artworks={sortedArtworks}
            initialIndex={sliderIndex}
            onClose={() => setSliderOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
