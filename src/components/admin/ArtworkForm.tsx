import { useState } from 'react';
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
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';

const artworkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  title_en: z.string().min(1, 'English title is required').max(200),
  description: z.string().max(2000).optional(),
  description_en: z.string().max(2000).optional(),
  dimensions: z.string().min(1, 'Dimensions are required').max(100),
  medium: z.string().max(200).optional(),
  medium_en: z.string().max(200).optional(),
  price: z.number().min(0, 'Price must be positive'),
  price_usd: z.number().min(0, 'USD price must be positive'),
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  status: z.enum(['for_sale', 'sold']),
});

type ArtworkFormData = z.infer<typeof artworkSchema>;

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
}

interface ArtworkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artwork?: Artwork | null;
  onSuccess: () => void;
}

export function ArtworkForm({ open, onOpenChange, artwork, onSuccess }: ArtworkFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(artwork?.image_url || '');
  const [imagePreview, setImagePreview] = useState(artwork?.image_url || '');

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
      status: (artwork?.status as 'for_sale' | 'sold') || 'for_sale',
    },
  });

  const status = watch('status');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please select an image file', variant: 'destructive' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Image must be less than 10MB', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setImagePreview(publicUrl);
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ArtworkFormData) => {
    if (!imageUrl) {
      toast({ title: 'Please upload an image', variant: 'destructive' });
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
        image_url: imageUrl,
      };

      if (artwork) {
        const { error } = await supabase
          .from('artworks')
          .update(artworkData)
          .eq('id', artwork.id);

        if (error) throw error;
        toast({ title: 'Artwork updated successfully' });
      } else {
        const { error } = await supabase
          .from('artworks')
          .insert([artworkData]);

        if (error) throw error;
        toast({ title: 'Artwork created successfully' });
      }

      reset();
      setImageUrl('');
      setImagePreview('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save artwork', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    reset();
    setImageUrl(artwork?.image_url || '');
    setImagePreview(artwork?.image_url || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {artwork ? 'Edit Artwork' : 'Add New Artwork'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Artwork Image *</Label>
            <div className="flex items-start gap-4">
              <div className="w-40 h-48 border border-dashed border-border bg-muted/50 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" className="gap-2" disabled={uploading}>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG, PNG, or WebP. Max 10MB.
                </p>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      setImageUrl('');
                      setImagePreview('');
                    }}
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Title fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Russian) *</Label>
              <Input id="title" {...register('title')} placeholder="Название работы" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">Title (English) *</Label>
              <Input id="title_en" {...register('title_en')} placeholder="Artwork title" />
              {errors.title_en && <p className="text-xs text-destructive">{errors.title_en.message}</p>}
            </div>
          </div>

          {/* Description fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (Russian)</Label>
              <Textarea id="description" {...register('description')} placeholder="Описание работы" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">Description (English)</Label>
              <Textarea id="description_en" {...register('description_en')} placeholder="Artwork description" rows={3} />
            </div>
          </div>

          {/* Details row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions *</Label>
              <Input id="dimensions" {...register('dimensions')} placeholder="100x80 см" />
              {errors.dimensions && <p className="text-xs text-destructive">{errors.dimensions.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setValue('status', v as 'for_sale' | 'sold')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medium fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medium">Medium (Russian)</Label>
              <Input id="medium" {...register('medium')} placeholder="Холст, масло" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medium_en">Medium (English)</Label>
              <Input id="medium_en" {...register('medium_en')} placeholder="Oil on canvas" />
            </div>
          </div>

          {/* Price fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (RUB) *</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                placeholder="100000"
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_usd">Price (USD) *</Label>
              <Input
                id="price_usd"
                type="number"
                {...register('price_usd', { valueAsNumber: true })}
                placeholder="1100"
              />
              {errors.price_usd && <p className="text-xs text-destructive">{errors.price_usd.message}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
  );
}
