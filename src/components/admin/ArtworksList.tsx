import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ArtworkForm } from './ArtworkForm';
import { SortableArtworkRow } from './SortableArtworkRow';
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
}

interface Artwork {
  id: string;
  title: string;
  title_en: string;
  description?: string | null;
  description_en?: string | null;
  image_url: string;
  price: number;
  price_usd: number;
  status: string;
  dimensions: string;
  medium?: string | null;
  medium_en?: string | null;
  year?: number | null;
  collection_id?: string | null;
  visibility: string;
  sort_order: number;
}

interface ArtworksListProps {
  initialFormOpen?: boolean;
  onFormOpenChange?: (open: boolean) => void;
}

export function ArtworksList({ initialFormOpen = false, onFormOpenChange }: ArtworksListProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(initialFormOpen);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCollection, setFilterCollection] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initialFormOpen && !formOpen) {
      setFormOpen(true);
    }
  }, [initialFormOpen]);

  useEffect(() => {
    onFormOpenChange?.(formOpen);
  }, [formOpen, onFormOpenChange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('sort_order');

      if (artworksError) throw artworksError;

      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, title, title_en')
        .order('sort_order');

      if (collectionsError) throw collectionsError;

      setArtworks(artworksData || []);
      setCollections(collectionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
    if (!over || active.id === over.id) return;

    const oldIndex = artworks.findIndex(a => a.id === active.id);
    const newIndex = artworks.findIndex(a => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newArtworks = [...artworks];
    const [moved] = newArtworks.splice(oldIndex, 1);
    newArtworks.splice(newIndex, 0, moved);

    // Update local state immediately for smooth UX
    const updatedArtworks = newArtworks.map((a, i) => ({ ...a, sort_order: i }));
    setArtworks(updatedArtworks);

    // Update in database
    try {
      const updates = updatedArtworks.map(a => ({ id: a.id, sort_order: a.sort_order }));
      for (const update of updates) {
        await supabase
          .from('artworks')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }
      toast({ title: language === 'ru' ? 'Порядок сохранён' : 'Order saved' });
    } catch (error) {
      console.error('Reorder error:', error);
      fetchData(); // Rollback on error
    }
  };

  const handleDelete = async () => {
    if (!artworkToDelete) return;
    setDeleting(true);
    try {
      await supabase
        .from('artwork_images')
        .delete()
        .eq('artwork_id', artworkToDelete.id);

      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkToDelete.id);

      if (error) throw error;
      toast({ title: language === 'ru' ? 'Картина удалена' : 'Artwork deleted' });
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка удаления' : 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setArtworkToDelete(null);
    }
  };

  const toggleVisibility = async (artwork: Artwork) => {
    try {
      const newVisibility = artwork.visibility === 'visible' ? 'hidden' : 'visible';
      const { error } = await supabase
        .from('artworks')
        .update({ visibility: newVisibility })
        .eq('id', artwork.id);

      if (error) throw error;
      
      setArtworks(prev => prev.map(a => 
        a.id === artwork.id ? { ...a, visibility: newVisibility } : a
      ));
      
      toast({ 
        title: newVisibility === 'visible' 
          ? (language === 'ru' ? 'Картина показана' : 'Artwork visible')
          : (language === 'ru' ? 'Картина скрыта' : 'Artwork hidden')
      });
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const filteredArtworks = filterCollection === 'all' 
    ? artworks 
    : filterCollection === 'none'
    ? artworks.filter(a => !a.collection_id)
    : artworks.filter(a => a.collection_id === filterCollection);

  const getCollectionName = (collectionId: string | null | undefined) => {
    if (!collectionId) return language === 'ru' ? 'Без коллекции' : 'No collection';
    const collection = collections.find(c => c.id === collectionId);
    return collection ? (language === 'ru' ? collection.title : collection.title_en) : '—';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">
            {language === 'ru' ? 'Картины' : 'Artworks'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ru' ? 'Управление работами галереи' : 'Manage gallery artworks'}
          </p>
        </div>
        <Button onClick={() => { setEditingArtwork(null); setFormOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {language === 'ru' ? 'Добавить картину' : 'Add Artwork'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={filterCollection} onValueChange={setFilterCollection}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'ru' ? 'Все картины' : 'All artworks'}</SelectItem>
              <SelectItem value="none">{language === 'ru' ? 'Без коллекции' : 'No collection'}</SelectItem>
              {collections.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {language === 'ru' ? col.title : col.title_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredArtworks.length} {language === 'ru' ? 'работ' : 'artworks'}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ru' ? 'Нет картин. Добавьте первую!' : 'No artworks yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider w-8"></th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Фото' : 'Image'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Название' : 'Title'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Коллекция' : 'Collection'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Цена' : 'Price'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Статус' : 'Status'}
                </th>
                <th className="text-right p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Действия' : 'Actions'}
                </th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredArtworks.map(a => a.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {filteredArtworks.map((artwork) => (
                    <SortableArtworkRow
                      key={artwork.id}
                      artwork={artwork}
                      collectionName={getCollectionName(artwork.collection_id)}
                      onToggleVisibility={() => toggleVisibility(artwork)}
                      onEdit={() => {
                        setEditingArtwork(artwork);
                        setFormOpen(true);
                      }}
                      onDelete={() => {
                        setArtworkToDelete(artwork);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      )}

      {/* Artwork Form */}
      <ArtworkForm
        open={formOpen}
        onOpenChange={setFormOpen}
        artwork={editingArtwork}
        onSuccess={fetchData}
        collections={collections}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ru' ? 'Удалить картину?' : 'Delete Artwork?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ru'
                ? `Вы уверены, что хотите удалить "${artworkToDelete?.title}"? Это действие нельзя отменить.`
                : `Are you sure you want to delete "${artworkToDelete?.title_en}"? This action cannot be undone.`
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
