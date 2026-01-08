import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Loader2, FolderOpen, Image, Video, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollectionForm } from './CollectionForm';
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

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      // Fetch collections
      const { data: collectionsData, error } = await supabase
        .from('collections')
        .select('*')
        .order('sort_order');

      if (error) throw error;

      // Fetch artwork counts per collection
      const { data: artworkCounts } = await supabase
        .from('artworks')
        .select('collection_id');

      // Fetch videos
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
            {language === 'ru' ? 'Тематические разделы сайта' : 'Thematic sections of the website'}
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
        <div className="grid gap-4">
          {collections.map((collection) => {
            const title = language === 'ru' ? collection.title : collection.title_en;
            const isPublished = collection.status === 'published';
            const canPublish = (collection.artworkCount || 0) >= 5 && 
                               (collection.artworkCount || 0) <= 7 && 
                               collection.hasVideo;

            return (
              <div
                key={collection.id}
                className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
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
                      onClick={() => {
                        setEditingCollection(collection);
                        setFormOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setCollectionToDelete(collection);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
