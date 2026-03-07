import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Artwork } from '@/types/artwork';
import heroImage from '@/assets/hero-artwork.jpg';

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
}

// Map database artwork to frontend type
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

export default function Home() {
  const { t, language } = useLanguage();
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('id, title, title_en, description, description_en, image_url, price, price_usd, status, dimensions, medium, year')
        .eq('visibility', 'visible')
        .order('sort_order')
        .limit(3);

      if (error) throw error;

      if (data && data.length > 0) {
        setFeaturedArtworks(data.map(mapDbToArtwork));
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  return (
    <>
      <SEOHead 
        title="Luna Art Gallery - Unique Fine Art Collection"
        description="Discover and collect unique fine artworks by Luna. Original paintings with worldwide shipping."
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Luna Art Gallery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col items-center justify-center px-6">
            <motion.div
              className="text-center space-y-8 max-w-4xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center gap-2 text-sm uppercase tracking-[0.3em] text-white/80"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ru' ? 'Авторские работы' : 'Original Artworks'}</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-display text-6xl md:text-7xl lg:text-[8rem] leading-[0.9] tracking-tight text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Luna Art Gallery
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                className="text-lg md:text-xl font-light tracking-wide text-white/70 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {language === 'ru' 
                  ? 'Уникальные картины, созданные с душой. Откройте для себя мир искусства и найдите произведение, которое станет частью вашего пространства.'
                  : 'Unique paintings created with soul. Discover the world of art and find a piece that will become part of your space.'
                }
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
                className="pt-4"
              >
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-medium tracking-wide hover:bg-white/90 transition-all duration-300"
                >
                  <span className="uppercase tracking-wider text-sm">{t.hero.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <ScrollIndicator />
            </motion.div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-32 md:py-40 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-20">
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t.home.featuredWorks}</p>
                  <h2 className="text-4xl md:text-6xl font-serif tracking-tight">
                    {t.gallery.title}
                  </h2>
                </div>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{t.home.viewAll}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </ScrollReveal>

            {/* Featured Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
              {featuredArtworks.map((artwork, index) => (
                <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-32 md:py-40 bg-secondary/30">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <ScrollReveal>
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{t.home.aboutArtist}</p>
                  <h2 className="text-4xl md:text-5xl font-serif">
                    {t.home.artistTitle}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t.home.artistDescription}
                  </p>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-foreground pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-colors"
                  >
                    <span>{t.home.learnMore}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="relative">
                  <div className="aspect-[4/5] bg-muted overflow-hidden">
                    <img
                      src="https://hvjlzajfbqspcnxpbrwg.supabase.co/storage/v1/object/public/artworks/buddha/budda1.jpg"
                      alt="Artist at work"
                      className="w-full h-full object-cover artwork-hover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-border bg-background" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}