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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Image as ImageIcon, Save } from 'lucide-react';

const settingsSchema = z.object({
  meta_title: z.string().max(60).optional(),
  meta_title_en: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
  meta_description_en: z.string().max(160).optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SiteSettingsData {
  id: string;
  meta_title?: string | null;
  meta_title_en?: string | null;
  meta_description?: string | null;
  meta_description_en?: string | null;
  og_image_url?: string | null;
}

export function SiteSettings() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [ogImageUrl, setOgImageUrl] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  const metaTitle = watch('meta_title') || '';
  const metaDescription = watch('meta_description') || '';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
        setOgImageUrl(data.og_image_url || '');
        reset({
          meta_title: data.meta_title || '',
          meta_title_en: data.meta_title_en || '',
          meta_description: data.meta_description || '',
          meta_description_en: data.meta_description_en || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'ru' ? 'Выберите изображение' : 'Please select an image',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `og/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      setOgImageUrl(publicUrl);
      toast({ title: language === 'ru' ? 'Изображение загружено' : 'Image uploaded' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to upload',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      const settingsData = {
        meta_title: data.meta_title || null,
        meta_title_en: data.meta_title_en || null,
        meta_description: data.meta_description || null,
        meta_description_en: data.meta_description_en || null,
        og_image_url: ogImageUrl || null,
      };

      if (settings) {
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([settingsData]);

        if (error) throw error;
      }

      toast({ title: language === 'ru' ? 'Настройки сохранены' : 'Settings saved' });
      fetchSettings();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-light">
          {language === 'ru' ? 'Настройки сайта' : 'Site Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ru' ? 'SEO и мета-теги' : 'SEO and meta tags'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* SEO Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-medium">
            {language === 'ru' ? 'SEO-настройки' : 'SEO Settings'}
          </h2>

          {/* Meta Title */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_title">
                Meta Title (RU)
                <span className="text-xs text-muted-foreground ml-2">{metaTitle.length}/60</span>
              </Label>
              <Input
                id="meta_title"
                {...register('meta_title')}
                placeholder="Luna Gallery — Современное искусство"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_title_en">Meta Title (EN)</Label>
              <Input
                id="meta_title_en"
                {...register('meta_title_en')}
                placeholder="Luna Gallery — Contemporary Art"
                maxLength={60}
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta_description">
                Meta Description (RU)
                <span className="text-xs text-muted-foreground ml-2">{metaDescription.length}/160</span>
              </Label>
              <Textarea
                id="meta_description"
                {...register('meta_description')}
                placeholder="Галерея современного искусства художницы Luna"
                rows={3}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_description_en">Meta Description (EN)</Label>
              <Textarea
                id="meta_description_en"
                {...register('meta_description_en')}
                placeholder="Contemporary art gallery by Luna"
                rows={3}
                maxLength={160}
              />
            </div>
          </div>

          {/* OpenGraph Image */}
          <div className="space-y-2">
            <Label>{language === 'ru' ? 'OpenGraph изображение' : 'OpenGraph Image'}</Label>
            <p className="text-xs text-muted-foreground">
              {language === 'ru' 
                ? 'Рекомендуемый размер: 1200x630 px' 
                : 'Recommended size: 1200x630 px'}
            </p>
            {ogImageUrl ? (
              <div className="relative max-w-md">
                <img
                  src={ogImageUrl}
                  alt="OG Image"
                  className="w-full aspect-[1200/630] object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setOgImageUrl('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative max-w-md border border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'Загрузить изображение' : 'Upload image'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {language === 'ru' ? 'Сохранить настройки' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
