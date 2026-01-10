import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollectionForm } from './CollectionForm';
import { SortableCollectionRow } from './SortableCollectionRow';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Collection {
  id: string;
  title: string;
  title_en: string;
  description?: string | null;
  description_en?: string | null;
  sort_order: number;
  status: string;
  artworkCount?: number;
  hasVideo?: boolean;
}

interface CollectionsListProps {
  onOpenArtworkForm: () => void;
}

export function CollectionsList({ onOpenArtworkForm }: CollectionsListProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const { data: collectionsData, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      const { data: artworkCounts } = await supabase
        .from('artworks')
        .select('collection_id');

      const { data: videos } = await supabase
        .from('collection_videos')
        .select('collection_id');

      const collectionsWithCounts = (collectionsData || []).map(col => ({
        ...col,
        artworkCount: artworkCounts?.filter(a => a.collection_id === col.id).length || 0,
        hasVideo: videos?.some(v => v.collection_id === col.id) || false,
      }));

      setCollections(collectionsWithCounts);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to load',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = collections.findIndex((c) => c.id === active.id);
      const newIndex = collections.findIndex((c) => c.id === over.id);

      const newCollections = arrayMove(collections, oldIndex, newIndex);
      setCollections(newCollections);

      // Update sort_order in database
      try {
        const updates = newCollections.map((col, index) => ({
          id: col.id,
          sort_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('collections')
            .update({ sort_order: update.sort_order })
            .eq('id', update.id);
        }

        toast({ title: language === 'ru' ? 'Порядок сохранён' : 'Order saved' });
      } catch (error) {
        console.error('Error updating order:', error);
        toast({
          title: language === 'ru' ? 'Ошибка сохранения порядка' : 'Failed to save order',
          variant: 'destructive',
        });
        fetchCollections();
      }
    }
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionToDelete.id);

      if (error) throw error;
      toast({ title: language === 'ru' ? 'Коллекция удалена' : 'Collection deleted' });
      fetchCollections();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка удаления' : 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">
            {language === 'ru' ? 'Коллекции' : 'Collections'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ru' ? 'Перетаскивайте для изменения порядка' : 'Drag to reorder'}
          </p>
        </div>
        <Button onClick={() => { setEditingCollection(null); setFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'ru' ? 'Новая коллекция' : 'New Collection'}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ru' ? 'Нет коллекций. Создайте первую!' : 'No collections yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={collections.map(c => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {collections.map((collection) => (
                <SortableCollectionRow
                  key={collection.id}
                  collection={collection}
                  onEdit={(col) => {
                    setEditingCollection(col);
                    setFormOpen(true);
                  }}
                  onDelete={(col) => {
                    setCollectionToDelete(col);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Collection Form */}
      <CollectionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        collection={editingCollection}
        onSuccess={fetchCollections}
        artworkCount={editingCollection?.artworkCount}
        hasVideo={editingCollection?.hasVideo}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ru' ? 'Удалить коллекцию?' : 'Delete Collection?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ru'
                ? `Вы уверены, что хотите удалить "${collectionToDelete?.title}"? Все привязанные картины будут отвязаны от коллекции.`
                : `Are you sure you want to delete "${collectionToDelete?.title_en}"? All linked artworks will be unlinked.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {language === 'ru' ? 'Удалить' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
