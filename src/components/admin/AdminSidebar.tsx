import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Image, 
  Video, 
  Settings,
  LogOut,
  Building2,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

type AdminTab = 'dashboard' | 'collections' | 'artworks' | 'videos' | 'galleries' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
}

const menuItems: { id: AdminTab; icon: typeof LayoutDashboard; label: string; labelEn: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Дашборд', labelEn: 'Dashboard' },
  { id: 'collections', icon: FolderOpen, label: 'Коллекции', labelEn: 'Collections' },
  { id: 'artworks', icon: Image, label: 'Картины', labelEn: 'Artworks' },
  { id: 'videos', icon: Video, label: 'Видео', labelEn: 'Videos' },
  { id: 'galleries', icon: Building2, label: 'Галереи', labelEn: 'Galleries' },
  { id: 'settings', icon: Settings, label: 'Настройки', labelEn: 'Settings' },
];

function SidebarNav({ activeTab, onTabChange, onSignOut, language, onItemClick }: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  language: string;
  onItemClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="font-serif text-xl">Luna Gallery</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {language === 'ru' ? 'Панель управления' : 'Admin Panel'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-center p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onItemClick?.();
              }}
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
    </div>
  );
}

export function AdminSidebar({ activeTab, onTabChange, onSignOut }: AdminSidebarProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarNav
                activeTab={activeTab}
                onTabChange={onTabChange}
                onSignOut={onSignOut}
                language={language}
                onItemClick={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <h1 className="font-serif text-lg">Luna Gallery</h1>
        </div>
        {/* Spacer */}
        <div className="h-14 shrink-0" />
      </>
    );
  }

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      <SidebarNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onSignOut={onSignOut}
        language={language}
      />
    </aside>
  );
}
