import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Upload, Image as ImageIcon, X, GripVertical } from 'lucide-react';
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
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const artworkSchema = z.object({
  title: z.string().trim().min(1, 'Название обязательно').max(200),
  title_en: z.string().trim().min(1, 'English title is required').max(200),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  description_en: z.string().trim().max(2000).optional().or(z.literal('')),
  dimensions: z.string().trim().min(1, 'Размеры обязательны').max(100),
  medium: z.string().trim().max(200).optional().or(z.literal('')),
  medium_en: z.string().trim().max(200).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Цена должна быть положительной'),
  price_usd: z.coerce.number().min(0, 'USD price must be positive'),
  year: z.union([
    z.coerce.number().min(1900).max(new Date().getFullYear()),
    z.literal('').transform(() => undefined),
    z.nan().transform(() => undefined),
  ]).optional(),
  status: z.enum(['for_sale', 'sold', 'reserved']),
});

type ArtworkFormData = z.infer<typeof artworkSchema>;

interface ArtworkImage {
  id?: string;
  uid: string;
  image_url: string;
  sort_order: number;
}

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
  dimensions: string;
  medium?: string | null;
  medium_en?: string | null;
  price: number;
  price_usd: number;
  year?: number | null;
  status: string;
  image_url: string;
  collection_id?: string | null;
  visibility?: string;
}

interface ArtworkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork?: Artwork | null;
  onSuccess: () => void;
  collections?: Collection[];
}

const MAX_IMAGES = 5;

let uidCounter = 0;
function generateUid(): string {
  uidCounter += 1;
  return `img-uid-${Date.now()}-${uidCounter}`;
}

// Sortable image component
interface SortableImageProps {
  image: ArtworkImage;
  index: number;
  isMain: boolean;
  language: string;
  onRemove: (index: number) => void;
  onPreview: (url: string) => void;
}

function SortableImage({ image, index, isMain, language, onRemove, onPreview }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.uid });

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
      className="relative group bg-muted rounded-lg overflow-hidden border border-border cursor-pointer"
      onClick={() => onPreview(image.image_url)}
    >
      <div className="aspect-square">
        <img
          src={image.image_url}
          alt={`Image ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {isMain && (
        <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
          {language === 'ru' ? 'Главная' : 'Main'}
        </div>
      )}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function ArtworkForm({ open, onOpenChange, artwork, onSuccess, collections = [] }: ArtworkFormProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(artwork?.collection_id || null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.uid === active.id);
      const newIndex = images.findIndex((img) => img.uid === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(images, oldIndex, newIndex).map((img, i) => ({
        ...img,
        sort_order: i,
      }));
      setImages(reordered);
    }
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkSchema),
    defaultValues: {
      title: artwork?.title || '',
      title_en: artwork?.title_en || '',
      description: artwork?.description || '',
      description_en: artwork?.description_en || '',
      dimensions: artwork?.dimensions || '',
      medium: artwork?.medium || '',
      medium_en: artwork?.medium_en || '',
      price: artwork?.price || 0,
      price_usd: artwork?.price_usd || 0,
      year: artwork?.year || undefined,
      status: (artwork?.status as 'for_sale' | 'sold' | 'reserved') || 'for_sale',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (open) {
      setSelectedCollectionId(artwork?.collection_id || null);
      reset({
        title: artwork?.title || '',
        title_en: artwork?.title_en || '',
        description: artwork?.description || '',
        description_en: artwork?.description_en || '',
        dimensions: artwork?.dimensions || '',
        medium: artwork?.medium || '',
        medium_en: artwork?.medium_en || '',
        price: artwork?.price || 0,
        price_usd: artwork?.price_usd || 0,
        year: artwork?.year || undefined,
        status: (artwork?.status as 'for_sale' | 'sold' | 'reserved') || 'for_sale',
      });
    }
  }, [open, artwork, reset]);

  useEffect(() => {
    if (open && artwork) {
      loadArtworkImages();
    } else if (open && !artwork) {
      setImages([]);
    }
  }, [open, artwork]);

  const loadArtworkImages = async () => {
    if (!artwork) return;
    setLoadingImages(true);
    try {
      const { data, error } = await supabase
        .from('artwork_images')
        .select('*')
        .eq('artwork_id', artwork.id)
        .order('sort_order');
      if (error) throw error;
      if (!data || data.length === 0) {
        setImages([{ uid: generateUid(), image_url: artwork.image_url, sort_order: 0 }]);
      } else {
        setImages(data.map((img) => ({ ...img, uid: img.id || generateUid() })));
      }
    } catch (error) {
      console.error('Error loading images:', error);
      setImages([{ uid: generateUid(), image_url: artwork.image_url, sort_order: 0 }]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast({ title: language === 'ru' ? 'Максимум 5 изображений' : 'Maximum 5 images allowed', variant: 'destructive' });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadedImages: ArtworkImage[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          toast({ title: language === 'ru' ? 'Выберите изображение' : 'Please select an image file', variant: 'destructive' });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: language === 'ru' ? 'Изображение должно быть менее 10MB' : 'Image must be less than 10MB', variant: 'destructive' });
          continue;
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('artworks').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('artworks').getPublicUrl(fileName);
        uploadedImages.push({
          uid: generateUid(),
          image_url: publicUrl,
          sort_order: images.length + uploadedImages.length,
        });
      }
      setImages(prev => [...prev, ...uploadedImages]);
      toast({ title: language === 'ru' ? 'Изображения загружены' : 'Images uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort_order: i })));
  };

  const onSubmit = async (data: ArtworkFormData) => {
    if (images.length === 0) {
      toast({ title: language === 'ru' ? 'Загрузите хотя бы одно изображение' : 'Please upload at least one image', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const artworkData = {
        title: data.title,
        title_en: data.title_en,
        description: data.description || null,
        description_en: data.description_en || null,
        dimensions: data.dimensions,
        medium: data.medium || null,
        medium_en: data.medium_en || null,
        price: data.price,
        price_usd: data.price_usd,
        year: data.year || null,
        status: data.status,
        image_url: images[0]?.image_url || '',
        collection_id: selectedCollectionId,
      };

      let artworkId: string;
      if (artwork) {
        const { error } = await supabase.from('artworks').update(artworkData).eq('id', artwork.id);
        if (error) throw error;
        artworkId = artwork.id;
        await supabase.from('artwork_images').delete().eq('artwork_id', artwork.id);
      } else {
        const { data: newArtwork, error } = await supabase.from('artworks').insert([artworkData]).select().single();
        if (error) throw error;
        artworkId = newArtwork.id;
      }

      if (images.length > 0) {
        const imagesToInsert = images.map((img, index) => ({
          artwork_id: artworkId,
          image_url: img.image_url,
          sort_order: index,
        }));
        const { error: imagesError } = await supabase.from('artwork_images').insert(imagesToInsert);
        if (imagesError) throw imagesError;
      }

      toast({
        title: artwork
          ? (language === 'ru' ? 'Работа обновлена' : 'Artwork updated')
          : (language === 'ru' ? 'Работа добавлена' : 'Artwork created')
      });
      reset();
      setImages([]);
      setSelectedCollectionId(null);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: language === 'ru' ? 'Ошибка сохранения' : 'Failed to save artwork', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedCollectionId(null);
    setImages([]);
    onOpenChange(false);
  };

  const getStatusLabel = (value: string) => {
    const labels = {
      for_sale: language === 'ru' ? 'В продаже' : 'For Sale',
      sold: language === 'ru' ? 'Продано' : 'Sold',
      reserved: language === 'ru' ? 'Резерв' : 'Reserved',
    };
    return labels[value as keyof typeof labels] || value;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent 
          className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {/* Fixed Header */}
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle className="font-serif text-2xl">
              {artwork
                ? (language === 'ru' ? 'Редактировать работу' : 'Edit Artwork')
                : (language === 'ru' ? 'Добавить работу' : 'Add New Artwork')
              }
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Image Upload Section - fixed height container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{language === 'ru' ? 'Изображения' : 'Images'} * ({images.length}/{MAX_IMAGES})</Label>
                  {images.length < MAX_IMAGES && (
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading
                          ? (language === 'ru' ? 'Загрузка...' : 'Uploading...')
                          : (language === 'ru' ? 'Загрузить' : 'Upload')
                        }
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image grid with min-height to prevent layout shift */}
                <div className="min-h-[120px]">
                  {loadingImages ? (
                    <div className="flex items-center justify-center h-[120px]">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : images.length === 0 ? (
                    <div className="border border-dashed border-border rounded-lg p-6 text-center bg-muted/30 h-[120px] flex flex-col items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {language === 'ru'
                          ? 'Загрузите до 5 изображений. Первое будет главным.'
                          : 'Upload up to 5 images. First one will be the main image.'
                        }
                      </p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={images.map((img) => img.uid)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-5 gap-2">
                          {images.map((image, index) => (
                            <SortableImage
                              key={image.uid}
                              image={image}
                              index={index}
                              isMain={index === 0}
                              language={language}
                              onRemove={removeImage}
                              onPreview={setPreviewUrl}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, WebP. {language === 'ru' ? 'Макс. 10MB на файл.' : 'Max 10MB per file.'}
                </p>
              </div>

              {/* Title fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{language === 'ru' ? 'Название (RU)' : 'Title (Russian)'} *</Label>
                  <Input id="title" {...register('title')} placeholder="Название работы" />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title_en">{language === 'ru' ? 'Название (EN)' : 'Title (English)'} *</Label>
                  <Input id="title_en" {...register('title_en')} placeholder="Artwork title" />
                  {errors.title_en && <p className="text-xs text-destructive">{errors.title_en.message}</p>}
                </div>
              </div>

              {/* Description fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{language === 'ru' ? 'Описание (RU)' : 'Description (Russian)'}</Label>
                  <Textarea id="description" {...register('description')} placeholder="Описание работы" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description_en">{language === 'ru' ? 'Описание (EN)' : 'Description (English)'}</Label>
                  <Textarea id="description_en" {...register('description_en')} placeholder="Artwork description" rows={3} />
                </div>
              </div>

              {/* Details row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">{language === 'ru' ? 'Размеры' : 'Dimensions'} *</Label>
                  <Input id="dimensions" {...register('dimensions')} placeholder="100x80 см" />
                  {errors.dimensions && <p className="text-xs text-destructive">{errors.dimensions.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">{language === 'ru' ? 'Год' : 'Year'}</Label>
                  <Input
                    id="year"
                    type="number"
                    {...register('year', { setValueAs: (v) => v === '' || v === undefined ? undefined : Number(v) })}
                    placeholder="2024"
                  />
                  {errors.year && 'message' in errors.year && <p className="text-xs text-destructive">{errors.year.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{language === 'ru' ? 'Статус' : 'Status'}</Label>
                  <Select value={status} onValueChange={(v) => setValue('status', v as 'for_sale' | 'sold' | 'reserved')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="for_sale">{getStatusLabel('for_sale')}</SelectItem>
                      <SelectItem value="sold">{getStatusLabel('sold')}</SelectItem>
                      <SelectItem value="reserved">{getStatusLabel('reserved')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Collection & Medium */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{language === 'ru' ? 'Коллекция' : 'Collection'}</Label>
                  <Select
                    value={selectedCollectionId || 'none'}
                    onValueChange={(v) => setSelectedCollectionId(v === 'none' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ru' ? 'Выберите коллекцию' : 'Select collection'} />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectItem value="none">{language === 'ru' ? 'Без коллекции' : 'No collection'}</SelectItem>
                      {collections.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {language === 'ru' ? col.title : col.title_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium">{language === 'ru' ? 'Техника (RU)' : 'Medium (Russian)'}</Label>
                  <Input id="medium" {...register('medium')} placeholder="Холст, масло" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium_en">{language === 'ru' ? 'Техника (EN)' : 'Medium (English)'}</Label>
                  <Input id="medium_en" {...register('medium_en')} placeholder="Oil on canvas" />
                </div>
              </div>

              {/* Price fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{language === 'ru' ? 'Цена (₽)' : 'Price (RUB)'} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    {...register('price', { setValueAs: (v) => v === '' ? 0 : Number(v) })}
                    placeholder="100000"
                  />
                  {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_usd">{language === 'ru' ? 'Цена ($)' : 'Price (USD)'} *</Label>
                  <Input
                    id="price_usd"
                    type="number"
                    min="0"
                    {...register('price_usd', { setValueAs: (v) => v === '' ? 0 : Number(v) })}
                    placeholder="1100"
                  />
                  {errors.price_usd && <p className="text-xs text-destructive">{errors.price_usd.message}</p>}
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex justify-end gap-3 bg-background">
              <Button type="button" variant="outline" onClick={handleClose}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t.common.save}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Preview Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
