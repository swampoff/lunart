import { motion } from 'framer-motion';
import { mockArtworks } from '@/data/mockArtworks';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { ScrollIndicator } from '@/components/ui/ScrollIndicator';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { SEOHead } from '@/components/seo/SEOHead';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  const featuredArtworks = mockArtworks.slice(0, 3);

  return (
    <>
      <SEOHead 
        title="Luna Gallery - Unique Fine Art Collection"
        description="Discover and collect unique fine artworks with worldwide shipping"
      />
      
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&q=80"
              alt="Luna Gallery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background" />
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
                className="flex items-center justify-center gap-2 text-sm uppercase tracking-[0.3em] text-foreground/70"
              >
                <Sparkles className="w-4 h-4" />
                <span>Fine Art Collection</span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                className="text-display text-7xl md:text-8xl lg:text-[10rem] leading-[0.85] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                {t.hero.title}
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p
                className="text-xl md:text-2xl font-light tracking-wide text-muted-foreground max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {t.hero.subtitle}
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
                  className="group inline-flex items-center gap-3 px-10 py-5 bg-foreground text-background font-medium tracking-wide hover:bg-foreground/90 transition-all duration-300"
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
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Featured Works</p>
                  <h2 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
                    {t.gallery.title}
                  </h2>
                </div>
                <Link
                  to="/gallery"
                  className="group inline-flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>View All</span>
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
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">About the Artist</p>
                  <h2 className="text-4xl md:text-5xl font-serif font-light">
                    Creating Art That Speaks
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Each piece in the Luna collection is a unique expression of emotion, 
                    color, and form. With influences from contemporary and abstract movements, 
                    these works invite you to pause and reflect.
                  </p>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-wider border-b border-foreground pb-1 hover:text-muted-foreground hover:border-muted-foreground transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="relative">
                  <div className="aspect-[4/5] bg-muted overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
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
