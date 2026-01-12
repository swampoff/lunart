import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Dashboard } from '@/components/admin/Dashboard';
import { CollectionsList } from '@/components/admin/CollectionsList';
import { ArtworksList } from '@/components/admin/ArtworksList';
import { VideosList } from '@/components/admin/VideosList';
import { GalleriesList } from '@/components/admin/GalleriesList';
import { SiteSettings } from '@/components/admin/SiteSettings';

type AdminTab = 'dashboard' | 'collections' | 'artworks' | 'videos' | 'galleries' | 'settings';

export default function Admin() {
  const { language } = useLanguage();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState({
    totalArtworks: 0,
    publishedArtworks: 0,
    totalCollections: 0,
    publishedCollections: 0,
  });
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: artworks } = await supabase.from('artworks').select('visibility');
    const { data: collections } = await supabase.from('collections').select('status');

    setStats({
      totalArtworks: artworks?.length || 0,
      publishedArtworks: artworks?.filter(a => a.visibility === 'visible').length || 0,
      totalCollections: collections?.length || 0,
      publishedCollections: collections?.filter(c => c.status === 'published').length || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: language === 'ru' ? 'Вы вышли из системы' : 'Signed out successfully' });
  };

  const handleAddArtwork = () => {
    setActiveTab('artworks');
    setArtworkFormOpen(true);
  };

  const handleAddCollection = () => {
    setActiveTab('collections');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSignOut={handleSignOut}
      />
      
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            onAddArtwork={handleAddArtwork}
            onAddCollection={handleAddCollection}
          />
        )}
        {activeTab === 'collections' && (
          <CollectionsList onOpenArtworkForm={handleAddArtwork} />
        )}
        {activeTab === 'artworks' && (
          <ArtworksList 
            initialFormOpen={artworkFormOpen}
            onFormOpenChange={setArtworkFormOpen}
          />
        )}
        {activeTab === 'videos' && <VideosList />}
        {activeTab === 'galleries' && <GalleriesList />}
        {activeTab === 'settings' && <SiteSettings />}
      </main>
    </div>
  );
}
