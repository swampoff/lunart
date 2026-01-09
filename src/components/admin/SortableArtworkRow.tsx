import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Artwork {
  id: string;
  title: string;
  title_en: string;
  image_url: string;
  price: number;
  price_usd: number;
  status: string;
  year?: number | null;
  collection_id?: string | null;
  visibility: string;
}

interface SortableArtworkRowProps {
  artwork: Artwork;
  collectionName: string;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableArtworkRow({
  artwork,
  collectionName,
  onToggleVisibility,
  onEdit,
  onDelete,
}: SortableArtworkRowProps) {
  const { language } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: artwork.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const title = language === 'ru' ? artwork.title : artwork.title_en;
  const price = language === 'ru'
    ? `${artwork.price.toLocaleString('ru-RU')} ₽`
    : `$${artwork.price_usd.toLocaleString('en-US')}`;
  const isHidden = artwork.visibility === 'hidden';

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; labelEn: string; class: string }> = {
      for_sale: { label: 'В продаже', labelEn: 'For Sale', class: 'bg-green-500/10 text-green-600' },
      sold: { label: 'Продано', labelEn: 'Sold', class: 'bg-muted text-muted-foreground' },
      reserved: { label: 'Резерв', labelEn: 'Reserved', class: 'bg-amber-500/10 text-amber-600' },
    };
    const badge = badges[status] || badges.for_sale;
    return (
      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${badge.class}`}>
        {language === 'ru' ? badge.label : badge.labelEn}
      </span>
    );
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-t border-border ${isHidden ? 'opacity-50' : ''} ${isDragging ? 'bg-muted' : ''}`}
    >
      <td className="p-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
      <td className="p-4">
        <div className="w-12 h-16 bg-muted rounded overflow-hidden">
          <img
            src={artwork.image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      </td>
      <td className="p-4">
        <p className="font-serif">{title}</p>
        {artwork.year && (
          <p className="text-xs text-muted-foreground">{artwork.year}</p>
        )}
      </td>
      <td className="p-4 text-sm text-muted-foreground">
        {collectionName}
      </td>
      <td className="p-4">{price}</td>
      <td className="p-4">{getStatusBadge(artwork.status)}</td>
      <td className="p-4">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            title={isHidden 
              ? (language === 'ru' ? 'Показать' : 'Show') 
              : (language === 'ru' ? 'Скрыть' : 'Hide')
            }
          >
            {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
