import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface GalleryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery?: Gallery | null;
  onSuccess: () => void;
}

export function GalleryForm({ open, onOpenChange, gallery, onSuccess }: GalleryFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: '',
    website: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (gallery) {
      setFormData({
        name: gallery.name,
        email: gallery.email,
        city: gallery.city || '',
        country: gallery.country || '',
        website: gallery.website || '',
        notes: gallery.notes || '',
        is_active: gallery.is_active,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        city: '',
        country: '',
        website: '',
        notes: '',
        is_active: true,
      });
    }
  }, [gallery, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        email: formData.email,
        city: formData.city || null,
        country: formData.country || null,
        website: formData.website || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      if (gallery) {
        const { error } = await supabase
          .from('galleries')
          .update(data)
          .eq('id', gallery.id);
        if (error) throw error;
        toast({ title: language === 'ru' ? 'Галерея обновлена' : 'Gallery updated' });
      } else {
        const { error } = await supabase
          .from('galleries')
          .insert(data);
        if (error) throw error;
        toast({ title: language === 'ru' ? 'Галерея добавлена' : 'Gallery added' });
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка сохранения' : 'Failed to save',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {gallery
              ? (language === 'ru' ? 'Редактировать галерею' : 'Edit Gallery')
              : (language === 'ru' ? 'Добавить галерею' : 'Add Gallery')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Название *' : 'Name *'}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Gagosian Gallery"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Email *' : 'Email *'}</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@gallery.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Город' : 'City'}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Страна' : 'Country'}</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="USA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Веб-сайт' : 'Website'}</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://gallery.com"
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Заметки' : 'Notes'}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={language === 'ru' ? 'Дополнительная информация...' : 'Additional notes...'}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label>{language === 'ru' ? 'Активна (включена в рассылку)' : 'Active (included in newsletter)'}</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {gallery
                ? (language === 'ru' ? 'Сохранить' : 'Save')
                : (language === 'ru' ? 'Добавить' : 'Add')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}