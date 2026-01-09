import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { X, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SortableImageItemProps {
  id: string;
  imageUrl: string;
  index: number;
  onRemove: () => void;
}

export function SortableImageItem({ id, imageUrl, index, onRemove }: SortableImageItemProps) {
  const { language } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-[3/4] bg-muted rounded-lg overflow-hidden border border-border"
    >
      <img
        src={imageUrl}
        alt={`Image ${index + 1}`}
        className="w-full h-full object-cover"
      />
      
      {/* Drag handle overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 cursor-grab active:cursor-grabbing touch-none p-1 rounded bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {index === 0 && (
        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
          {language === 'ru' ? 'Главная' : 'Main'}
        </div>
      )}

      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={onRemove}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
