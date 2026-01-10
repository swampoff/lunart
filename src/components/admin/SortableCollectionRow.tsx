import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FolderOpen, Image, Video, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Collection {
  id: string;
  title: string;
  title_en: string;
  sort_order: number;
  status: string;
  artworkCount?: number;
  hasVideo?: boolean;
}

interface SortableCollectionRowProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

export function SortableCollectionRow({ collection, onEdit, onDelete }: SortableCollectionRowProps) {
  const { language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const title = language === 'ru' ? collection.title : collection.title_en;
  const isPublished = collection.status === 'published';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
          <FolderOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-serif text-lg">{title}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Image className="w-4 h-4" />
              {collection.artworkCount}/7 {language === 'ru' ? 'фото' : 'photos'}
            </span>
            <span className={`flex items-center gap-1 ${collection.hasVideo ? 'text-green-600' : 'text-amber-600'}`}>
              <Video className="w-4 h-4" />
              {collection.hasVideo
                ? (language === 'ru' ? 'Есть видео' : 'Has video')
                : (language === 'ru' ? 'Нет видео' : 'No video')
              }
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status badge */}
        <span className={`flex items-center gap-1.5 text-xs uppercase tracking-wider px-3 py-1.5 rounded ${
          isPublished
            ? 'bg-green-500/10 text-green-600'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isPublished
            ? (language === 'ru' ? 'Опубликовано' : 'Published')
            : (language === 'ru' ? 'Черновик' : 'Draft')
          }
        </span>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(collection)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(collection)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
