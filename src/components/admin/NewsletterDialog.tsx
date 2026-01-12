import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Gallery {
  id: string;
  name: string;
  email: string;
}

interface Artwork {
  id: string;
  title: string;
  title_en: string;
  image_url: string;
  price: number;
  price_usd: number;
}

interface NewsletterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleries: Gallery[];
}

export function NewsletterDialog({ open, onOpenChange, galleries }: NewsletterDialogProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<string>('');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (open) {
      fetchArtworks();
      setSent(false);
    }
  }, [open]);

  const fetchArtworks = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('id, title, title_en, image_url, price, price_usd')
      .eq('visibility', 'visible')
      .order('sort_order')
      .limit(20);
    setArtworks(data || []);
  };

  const handleSend = async () => {
    if (!formData.subject || !formData.message) {
      toast({
        title: language === 'ru' ? 'Заполните все поля' : 'Fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const artwork = artworks.find(a => a.id === selectedArtwork);
      
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          galleries: galleries.map(g => ({ name: g.name, email: g.email })),
          subject: formData.subject,
          message: formData.message,
          artwork: artwork ? {
            title: artwork.title,
            title_en: artwork.title_en,
            image_url: artwork.image_url,
            price: artwork.price,
            price_usd: artwork.price_usd,
          } : null,
        },
      });

      if (error) throw error;

      setSent(true);
      toast({ 
        title: language === 'ru' 
          ? `Рассылка отправлена ${galleries.length} галереям` 
          : `Newsletter sent to ${galleries.length} galleries` 
      });
    } catch (error: any) {
      console.error('Send error:', error);
      toast({
        title: language === 'ru' ? 'Ошибка отправки' : 'Failed to send',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {language === 'ru' ? 'Рассылка галереям' : 'Gallery Newsletter'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ru' 
              ? `Отправка на ${galleries.length} активных галерей`
              : `Sending to ${galleries.length} active galleries`
            }
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-serif mb-2">
              {language === 'ru' ? 'Рассылка отправлена!' : 'Newsletter Sent!'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ru' 
                ? `Письма отправлены на ${galleries.length} адресов`
                : `Emails sent to ${galleries.length} addresses`
              }
            </p>
            <Button className="mt-6" onClick={() => onOpenChange(false)}>
              {language === 'ru' ? 'Закрыть' : 'Close'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Тема письма *' : 'Subject *'}</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={language === 'ru' ? 'Новая работа художника Luna' : 'New artwork by Luna'}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Прикрепить работу' : 'Attach artwork'}</Label>
              <Select value={selectedArtwork} onValueChange={setSelectedArtwork}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ru' ? 'Выберите работу...' : 'Select artwork...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{language === 'ru' ? 'Без работы' : 'No artwork'}</SelectItem>
                  {artworks.map((artwork) => (
                    <SelectItem key={artwork.id} value={artwork.id}>
                      {language === 'ru' ? artwork.title : artwork.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedArtwork && selectedArtwork !== 'none' && (
              <div className="flex gap-4 p-4 bg-secondary/50 rounded-lg">
                <img
                  src={artworks.find(a => a.id === selectedArtwork)?.image_url}
                  alt=""
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="font-serif">
                    {language === 'ru' 
                      ? artworks.find(a => a.id === selectedArtwork)?.title
                      : artworks.find(a => a.id === selectedArtwork)?.title_en
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ru'
                      ? `${artworks.find(a => a.id === selectedArtwork)?.price.toLocaleString('ru-RU')} ₽`
                      : `$${artworks.find(a => a.id === selectedArtwork)?.price_usd.toLocaleString('en-US')}`
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>{language === 'ru' ? 'Сообщение *' : 'Message *'}</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={language === 'ru' 
                  ? 'Добрый день! Рад представить вам новую работу...' 
                  : 'Dear Gallery, I am pleased to present a new artwork...'
                }
                rows={6}
              />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                {language === 'ru'
                  ? 'Письма будут отправлены всем активным галереям в базе. Убедитесь, что текст корректен.'
                  : 'Emails will be sent to all active galleries. Please verify the content before sending.'
                }
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2">
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {language === 'ru' ? 'Отправить' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}