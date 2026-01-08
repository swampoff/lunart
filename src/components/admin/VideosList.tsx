import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Loader2, Video as VideoIcon, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VideoForm } from './VideoForm';
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

interface CollectionVideo {
  id: string;
  title: string;
  title_en?: string | null;
  description?: string | null;
  description_en?: string | null;
  video_url: string;
  cover_url?: string | null;
  collection_id: string;
  collection?: Collection;
}

export function VideosList() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [videos, setVideos] = useState<CollectionVideo[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<CollectionVideo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<CollectionVideo | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch videos
      const { data: videosData, error: videosError } = await supabase
        .from('collection_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      // Fetch collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('id, title, title_en')
        .order('sort_order');

      if (collectionsError) throw collectionsError;

      // Map collection names to videos
      const videosWithCollections = (videosData || []).map(video => ({
        ...video,
        collection: collectionsData?.find(c => c.id === video.collection_id),
      }));

      setVideos(videosWithCollections);
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

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('collection_videos')
        .delete()
        .eq('id', videoToDelete.id);

      if (error) throw error;
      toast({ title: language === 'ru' ? 'Видео удалено' : 'Video deleted' });
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
      setVideoToDelete(null);
    }
  };

  const existingVideoCollectionIds = videos.map(v => v.collection_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">
            {language === 'ru' ? 'Видео' : 'Videos'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ru' ? 'Видео для каждой коллекции' : 'Videos for each collection'}
          </p>
        </div>
        <Button 
          onClick={() => { setEditingVideo(null); setFormOpen(true); }} 
          className="gap-2"
          disabled={collections.length === 0 || existingVideoCollectionIds.length >= collections.length}
        >
          <Plus className="w-4 h-4" />
          {language === 'ru' ? 'Добавить видео' : 'Add Video'}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <VideoIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ru' ? 'Сначала создайте коллекцию' : 'Create a collection first'}
          </p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <VideoIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ru' ? 'Нет видео. Добавьте первое!' : 'No videos yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((video) => {
            const title = language === 'ru' ? video.title : (video.title_en || video.title);
            const collectionTitle = language === 'ru' 
              ? video.collection?.title 
              : video.collection?.title_en;

            return (
              <div
                key={video.id}
                className="bg-card border border-border rounded-lg overflow-hidden"
              >
                {/* Video preview */}
                <div className="relative aspect-video bg-muted">
                  {video.cover_url ? (
                    <img 
                      src={video.cover_url} 
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={video.video_url} 
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-foreground ml-1" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-serif text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ru' ? 'Коллекция:' : 'Collection:'} {collectionTitle || '—'}
                  </p>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingVideo(video);
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
                        setVideoToDelete(video);
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

      {/* Video Form */}
      <VideoForm
        open={formOpen}
        onOpenChange={setFormOpen}
        video={editingVideo}
        collections={collections}
        existingVideoCollectionIds={existingVideoCollectionIds}
        onSuccess={fetchData}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ru' ? 'Удалить видео?' : 'Delete Video?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ru'
                ? `Вы уверены, что хотите удалить "${videoToDelete?.title}"?`
                : `Are you sure you want to delete "${videoToDelete?.title}"?`
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
