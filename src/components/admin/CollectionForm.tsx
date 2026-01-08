import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const collectionSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200),
  title_en: z.string().min(1, 'English title is required').max(200),
  description: z.string().max(1000).optional(),
  description_en: z.string().max(1000).optional(),
  sort_order: z.number().min(0),
  status: z.enum(['draft', 'published']),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface Collection {
  id: string;
  title: string;
  title_en: string;
  description?: string | null;
  description_en?: string | null;
  sort_order: number;
  status: string;
}

interface CollectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection | null;
  onSuccess: () => void;
  artworkCount?: number;
  hasVideo?: boolean;
}

export function CollectionForm({ open, onOpenChange, collection, onSuccess, artworkCount = 0, hasVideo = false }: CollectionFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      title: collection?.title || '',
      title_en: collection?.title_en || '',
      description: collection?.description || '',
      description_en: collection?.description_en || '',
      sort_order: collection?.sort_order || 0,
      status: (collection?.status as 'draft' | 'published') || 'draft',
    },
  });

  useEffect(() => {
    if (open && collection) {
      reset({
        title: collection.title,
        title_en: collection.title_en,
        description: collection.description || '',
        description_en: collection.description_en || '',
        sort_order: collection.sort_order,
        status: collection.status as 'draft' | 'published',
      });
    } else if (open && !collection) {
      reset({
        title: '',
        title_en: '',
        description: '',
        description_en: '',
        sort_order: 0,
        status: 'draft',
      });
    }
  }, [open, collection, reset]);

  const status = watch('status');

  const canPublish = artworkCount >= 5 && artworkCount <= 7 && hasVideo;
  const publishError = !canPublish && status === 'published';

  const getPublishWarning = () => {
    const warnings = [];
    if (artworkCount < 5) warnings.push(language === 'ru' ? `Нужно минимум 5 фото (сейчас: ${artworkCount})` : `Minimum 5 photos required (current: ${artworkCount})`);
    if (artworkCount > 7) warnings.push(language === 'ru' ? `Максимум 7 фото (сейчас: ${artworkCount})` : `Maximum 7 photos allowed (current: ${artworkCount})`);
    if (!hasVideo) warnings.push(language === 'ru' ? 'Нужно добавить видео' : 'Video is required');
    return warnings;
  };

  const onSubmit = async (data: CollectionFormData) => {
    // Validate publication requirements
    if (data.status === 'published' && !canPublish) {
      toast({
        title: language === 'ru' ? 'Невозможно опубликовать' : 'Cannot publish',
        description: getPublishWarning().join('. '),
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const collectionData = {
        title: data.title,
        title_en: data.title_en,
        description: data.description || null,
        description_en: data.description_en || null,
        sort_order: data.sort_order,
        status: data.status,
      };

      if (collection) {
        const { error } = await supabase
          .from('collections')
          .update(collectionData)
          .eq('id', collection.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .insert([collectionData]);

        if (error) throw error;
      }

      toast({
        title: collection
          ? (language === 'ru' ? 'Коллекция обновлена' : 'Collection updated')
          : (language === 'ru' ? 'Коллекция создана' : 'Collection created'),
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка сохранения' : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {collection
              ? (language === 'ru' ? 'Редактировать коллекцию' : 'Edit Collection')
              : (language === 'ru' ? 'Новая коллекция' : 'New Collection')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Title fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{language === 'ru' ? 'Название (RU)' : 'Title (Russian)'} *</Label>
              <Input id="title" {...register('title')} placeholder="Название коллекции" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">{language === 'ru' ? 'Название (EN)' : 'Title (English)'} *</Label>
              <Input id="title_en" {...register('title_en')} placeholder="Collection title" />
              {errors.title_en && <p className="text-xs text-destructive">{errors.title_en.message}</p>}
            </div>
          </div>

          {/* Description fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{language === 'ru' ? 'Описание (RU)' : 'Description (Russian)'}</Label>
              <Textarea id="description" {...register('description')} placeholder="Описание" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{language === 'ru' ? 'Описание (EN)' : 'Description (English)'}</Label>
              <Textarea id="description_en" {...register('description_en')} placeholder="Description" rows={3} />
            </div>
          </div>

          {/* Sort order and status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">{language === 'ru' ? 'Порядок' : 'Sort Order'}</Label>
              <Input
                id="sort_order"
                type="number"
                {...register('sort_order', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Статус' : 'Status'}</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value as 'draft' | 'published')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{language === 'ru' ? 'Черновик' : 'Draft'}</SelectItem>
                  <SelectItem value="published">{language === 'ru' ? 'Опубликовано' : 'Published'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Publication warnings */}
          {collection && !canPublish && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-600 mb-2">
                {language === 'ru' ? 'Требования для публикации:' : 'Publication requirements:'}
              </p>
              <ul className="text-sm text-amber-600 space-y-1">
                {getPublishWarning().map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {language === 'ru' ? 'Сохранить' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
