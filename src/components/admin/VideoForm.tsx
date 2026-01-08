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
import { Loader2, Upload, X, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';

const videoSchema = z.object({
  title: z.string().min(1, 'Название обязательно').max(200),
  title_en: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  description_en: z.string().max(1000).optional(),
  collection_id: z.string().min(1, 'Выберите коллекцию'),
});

type VideoFormData = z.infer<typeof videoSchema>;

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
}

interface VideoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video?: CollectionVideo | null;
  collections: Collection[];
  existingVideoCollectionIds: string[];
  onSuccess: () => void;
}

export function VideoForm({ open, onOpenChange, video, collections, existingVideoCollectionIds, onSuccess }: VideoFormProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>(video?.video_url || '');
  const [coverUrl, setCoverUrl] = useState<string>(video?.cover_url || '');

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<VideoFormData>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: video?.title || '',
      title_en: video?.title_en || '',
      description: video?.description || '',
      description_en: video?.description_en || '',
      collection_id: video?.collection_id || '',
    },
  });

  const collectionId = watch('collection_id');

  useEffect(() => {
    if (open && video) {
      reset({
        title: video.title,
        title_en: video.title_en || '',
        description: video.description || '',
        description_en: video.description_en || '',
        collection_id: video.collection_id,
      });
      setVideoUrl(video.video_url);
      setCoverUrl(video.cover_url || '');
    } else if (open && !video) {
      reset({
        title: '',
        title_en: '',
        description: '',
        description_en: '',
        collection_id: '',
      });
      setVideoUrl('');
      setCoverUrl('');
    }
  }, [open, video, reset]);

  // Filter collections that don't already have a video (unless editing)
  const availableCollections = collections.filter(col => 
    !existingVideoCollectionIds.includes(col.id) || col.id === video?.collection_id
  );

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({ 
        title: language === 'ru' ? 'Выберите видео файл' : 'Please select a video file', 
        variant: 'destructive' 
      });
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({ 
        title: language === 'ru' ? 'Видео должно быть менее 100MB' : 'Video must be less than 100MB', 
        variant: 'destructive' 
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      setVideoUrl(publicUrl);
      toast({ title: language === 'ru' ? 'Видео загружено' : 'Video uploaded' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to upload', 
        variant: 'destructive' 
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: language === 'ru' ? 'Выберите изображение' : 'Please select an image', 
        variant: 'destructive' 
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ 
        title: language === 'ru' ? 'Изображение должно быть менее 10MB' : 'Image must be less than 10MB', 
        variant: 'destructive' 
      });
      return;
    }

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);

      setCoverUrl(publicUrl);
      toast({ title: language === 'ru' ? 'Обложка загружена' : 'Cover uploaded' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: language === 'ru' ? 'Ошибка загрузки' : 'Failed to upload', 
        variant: 'destructive' 
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const onSubmit = async (data: VideoFormData) => {
    if (!videoUrl) {
      toast({ 
        title: language === 'ru' ? 'Загрузите видео' : 'Please upload a video', 
        variant: 'destructive' 
      });
      return;
    }

    setSaving(true);
    try {
      const videoData = {
        title: data.title,
        title_en: data.title_en || null,
        description: data.description || null,
        description_en: data.description_en || null,
        collection_id: data.collection_id,
        video_url: videoUrl,
        cover_url: coverUrl || null,
      };

      if (video) {
        const { error } = await supabase
          .from('collection_videos')
          .update(videoData)
          .eq('id', video.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collection_videos')
          .insert([videoData]);

        if (error) throw error;
      }

      toast({
        title: video
          ? (language === 'ru' ? 'Видео обновлено' : 'Video updated')
          : (language === 'ru' ? 'Видео добавлено' : 'Video added'),
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({ 
        title: language === 'ru' ? 'Ошибка сохранения' : 'Failed to save', 
        variant: 'destructive' 
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
            {video
              ? (language === 'ru' ? 'Редактировать видео' : 'Edit Video')
              : (language === 'ru' ? 'Добавить видео' : 'Add Video')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Collection select */}
          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Коллекция' : 'Collection'} *</Label>
            <Select
              value={collectionId}
              onValueChange={(value) => setValue('collection_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={language === 'ru' ? 'Выберите коллекцию' : 'Select collection'} />
              </SelectTrigger>
              <SelectContent>
                {availableCollections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {language === 'ru' ? col.title : col.title_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.collection_id && <p className="text-xs text-destructive">{errors.collection_id.message}</p>}
            {availableCollections.length === 0 && (
              <p className="text-xs text-amber-600">
                {language === 'ru' 
                  ? 'Все коллекции уже имеют видео' 
                  : 'All collections already have videos'}
              </p>
            )}
          </div>

          {/* Video upload */}
          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Видео файл' : 'Video File'} *</Label>
            {videoUrl ? (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video src={videoUrl} controls className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setVideoUrl('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="relative border border-dashed border-border rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={handleVideoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingVideo}
                />
                <VideoIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                {uploadingVideo ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'ru' ? 'Загрузка...' : 'Uploading...'}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'MP4, MOV. Макс. 100MB' : 'MP4, MOV. Max 100MB'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cover upload */}
          <div className="space-y-2">
            <Label>{language === 'ru' ? 'Обложка видео' : 'Video Cover'}</Label>
            {coverUrl ? (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setCoverUrl('')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="relative border border-dashed border-border rounded-lg p-4 text-center max-w-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingCover}
                />
                {uploadingCover ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    {language === 'ru' ? 'Загрузить обложку' : 'Upload cover'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{language === 'ru' ? 'Название (RU)' : 'Title (Russian)'} *</Label>
              <Input id="title" {...register('title')} placeholder="Название видео" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">{language === 'ru' ? 'Название (EN)' : 'Title (English)'}</Label>
              <Input id="title_en" {...register('title_en')} placeholder="Video title" />
            </div>
          </div>

          {/* Description fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{language === 'ru' ? 'Описание (RU)' : 'Description (Russian)'}</Label>
              <Textarea id="description" {...register('description')} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_en">{language === 'ru' ? 'Описание (EN)' : 'Description (English)'}</Label>
              <Textarea id="description_en" {...register('description_en')} rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'ru' ? 'Отмена' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={saving || availableCollections.length === 0}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {language === 'ru' ? 'Сохранить' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
