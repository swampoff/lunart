import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Loader2, Building2, Mail, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GalleryForm } from './GalleryForm';
import { NewsletterDialog } from './NewsletterDialog';
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

interface Gallery {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  country?: string | null;
  website?: string | null;
  notes?: string | null;
  is_active: boolean;
}

export function GalleriesList() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [galleryToDelete, setGalleryToDelete] = useState<Gallery | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('name');

      if (error) throw error;
      setGalleries(data || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast({
        title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to load',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!galleryToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', galleryToDelete.id);

      if (error) throw error;
      toast({ title: language === 'ru' ? 'Галерея удалена' : 'Gallery deleted' });
      fetchGalleries();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка удаления' : 'Failed to delete',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setGalleryToDelete(null);
    }
  };

  const filteredGalleries = galleries.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGalleries = galleries.filter(g => g.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-light">
            {language === 'ru' ? 'Галереи' : 'Galleries'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ru' ? 'База галерей для рассылки' : 'Gallery database for newsletter'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setNewsletterOpen(true)}
            disabled={activeGalleries.length === 0}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {language === 'ru' ? 'Рассылка' : 'Newsletter'}
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
              {activeGalleries.length}
            </span>
          </Button>
          <Button onClick={() => { setEditingGallery(null); setFormOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ru' ? 'Добавить галерею' : 'Add Gallery'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="w-64">
        <Input
          placeholder={language === 'ru' ? 'Поиск...' : 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-lg">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ru' ? 'Нет галерей. Добавьте первую!' : 'No galleries yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Название' : 'Name'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Email' : 'Email'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Город' : 'City'}
                </th>
                <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">
                  {language === 'ru' ? 'Страна' : 'Country'}
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
              {filteredGalleries.map((gallery) => (
                <tr key={gallery.id} className={`border-t border-border ${!gallery.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <p className="font-medium">{gallery.name}</p>
                    {gallery.website && (
                      <a 
                        href={gallery.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {gallery.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </td>
                  <td className="p-4">
                    <a href={`mailto:${gallery.email}`} className="flex items-center gap-1 text-sm hover:text-primary">
                      <Mail className="w-3 h-3" />
                      {gallery.email}
                    </a>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {gallery.city || '—'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {gallery.country || '—'}
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${
                      gallery.is_active 
                        ? 'bg-green-500/10 text-green-600' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {gallery.is_active 
                        ? (language === 'ru' ? 'Активна' : 'Active')
                        : (language === 'ru' ? 'Неактивна' : 'Inactive')
                      }
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingGallery(gallery);
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
                          setGalleryToDelete(gallery);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gallery Form */}
      <GalleryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        gallery={editingGallery}
        onSuccess={fetchGalleries}
      />

      {/* Newsletter Dialog */}
      <NewsletterDialog
        open={newsletterOpen}
        onOpenChange={setNewsletterOpen}
        galleries={activeGalleries}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ru' ? 'Удалить галерею?' : 'Delete Gallery?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ru'
                ? `Вы уверены, что хотите удалить "${galleryToDelete?.name}"?`
                : `Are you sure you want to delete "${galleryToDelete?.name}"?`
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