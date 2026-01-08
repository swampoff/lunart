import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Image, FolderOpen, CheckCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  stats: {
    totalArtworks: number;
    publishedArtworks: number;
    totalCollections: number;
    publishedCollections: number;
  };
  onAddArtwork: () => void;
  onAddCollection: () => void;
}

export function Dashboard({ stats, onAddArtwork, onAddCollection }: DashboardProps) {
  const { language } = useLanguage();

  const statCards = [
    { 
      icon: Image, 
      label: language === 'ru' ? 'Всего картин' : 'Total Artworks', 
      value: stats.totalArtworks,
      color: 'bg-blue-500/10 text-blue-600'
    },
    { 
      icon: CheckCircle, 
      label: language === 'ru' ? 'Опубликовано' : 'Published', 
      value: stats.publishedArtworks,
      color: 'bg-green-500/10 text-green-600'
    },
    { 
      icon: FolderOpen, 
      label: language === 'ru' ? 'Коллекций' : 'Collections', 
      value: stats.totalCollections,
      color: 'bg-purple-500/10 text-purple-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-light">
          {language === 'ru' ? 'Дашборд' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {language === 'ru' ? 'Обзор вашей галереи' : 'Overview of your gallery'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-serif">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">
          {language === 'ru' ? 'Быстрые действия' : 'Quick Actions'}
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={onAddArtwork} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ru' ? 'Добавить картину' : 'Add Artwork'}
          </Button>
          <Button onClick={onAddCollection} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'ru' ? 'Создать коллекцию' : 'Create Collection'}
          </Button>
        </div>
      </div>
    </div>
  );
}
