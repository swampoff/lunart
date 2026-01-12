import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Image, 
  Video, 
  Settings,
  LogOut,
  Building2
} from 'lucide-react';

type AdminTab = 'dashboard' | 'collections' | 'artworks' | 'videos' | 'galleries' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
}

export function AdminSidebar({ activeTab, onTabChange, onSignOut }: AdminSidebarProps) {
  const { language } = useLanguage();

  const menuItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string; labelEn: string }[] = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Дашборд', labelEn: 'Dashboard' },
    { id: 'collections', icon: FolderOpen, label: 'Коллекции', labelEn: 'Collections' },
    { id: 'artworks', icon: Image, label: 'Картины', labelEn: 'Artworks' },
    { id: 'videos', icon: Video, label: 'Видео', labelEn: 'Videos' },
    { id: 'galleries', icon: Building2, label: 'Галереи', labelEn: 'Galleries' },
    { id: 'settings', icon: Settings, label: 'Настройки', labelEn: 'Settings' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="font-serif text-xl">Luna Gallery</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'ru' ? 'Панель управления' : 'Admin Panel'}
        </p>
      </div>

      {/* Navigation - centered vertically */}
      <nav className="flex-1 flex flex-col justify-center p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {language === 'ru' ? item.label : item.labelEn}
            </button>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors rounded-lg"
        >
          <LogOut className="w-5 h-5" />
          {language === 'ru' ? 'Выйти' : 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
