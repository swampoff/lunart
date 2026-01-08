import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ArtworkForm } from './ArtworkForm';
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
      // Fetch artworks
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .order('sort_order');

      if (artworksError) throw artworksError;

      // Fetch collections
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

  const handleDelete = async () => {
    if (!artworkToDelete) return;
    setDeleting(true);
    try {
      // Delete artwork images first
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
            <tbody>
              {filteredArtworks.map((artwork) => {
                const title = language === 'ru' ? artwork.title : artwork.title_en;
                const price = language === 'ru'
                  ? `${artwork.price.toLocaleString('ru-RU')} ₽`
                  : `$${artwork.price_usd.toLocaleString('en-US')}`;
                const isHidden = artwork.visibility === 'hidden';

                return (
                  <tr key={artwork.id} className={`border-t border-border ${isHidden ? 'opacity-50' : ''}`}>
                    <td className="p-4">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
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
                      {getCollectionName(artwork.collection_id)}
                    </td>
                    <td className="p-4">{price}</td>
                    <td className="p-4">{getStatusBadge(artwork.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVisibility(artwork)}
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
                          onClick={() => {
                            setEditingArtwork(artwork);
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
                            setArtworkToDelete(artwork);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
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
