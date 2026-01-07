import { useLanguage } from '@/contexts/LanguageContext';
import { ArtworkStyle, ArtworkSize } from '@/types/artwork';
import { Button } from '@/components/ui/button';

interface GalleryFiltersProps {
  selectedStyle: ArtworkStyle | 'all';
  selectedSize: ArtworkSize | 'all';
  sortBy: 'newest' | 'price_asc' | 'price_desc';
  onStyleChange: (style: ArtworkStyle | 'all') => void;
  onSizeChange: (size: ArtworkSize | 'all') => void;
  onSortChange: (sort: 'newest' | 'price_asc' | 'price_desc') => void;
}

export function GalleryFilters({
  selectedStyle,
  selectedSize,
  sortBy,
  onStyleChange,
  onSizeChange,
  onSortChange,
}: GalleryFiltersProps) {
  const { t } = useLanguage();

  const styles: { value: ArtworkStyle | 'all'; label: string }[] = [
    { value: 'all', label: t.filters.all },
    { value: 'abstract', label: t.filters.abstract },
    { value: 'portrait', label: t.filters.portrait },
    { value: 'landscape', label: t.filters.landscape },
    { value: 'modern', label: t.filters.modern },
  ];

  const sizes: { value: ArtworkSize | 'all'; label: string }[] = [
    { value: 'all', label: t.filters.all },
    { value: 'small', label: t.filters.small },
    { value: 'medium', label: t.filters.medium },
    { value: 'large', label: t.filters.large },
  ];

  return (
    <div className="space-y-6 pb-8 border-b border-border">
      {/* Style Filter */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {t.gallery.filterStyle}
        </h4>
        <div className="flex flex-wrap gap-2">
          {styles.map(style => (
            <Button
              key={style.value}
              variant={selectedStyle === style.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStyleChange(style.value)}
              className="text-xs"
            >
              {style.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {t.gallery.filterSize}
        </h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <Button
              key={size.value}
              variant={selectedSize === size.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSizeChange(size.value)}
              className="text-xs"
            >
              {size.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {t.gallery.filterPrice}
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === 'price_asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('price_asc')}
            className="text-xs"
          >
            {t.filters.priceAsc}
          </Button>
          <Button
            variant={sortBy === 'price_desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSortChange('price_desc')}
            className="text-xs"
          >
            {t.filters.priceDesc}
          </Button>
        </div>
      </div>
    </div>
  );
}
