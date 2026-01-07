import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Package, BarChart3, Image, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { ArtworkForm } from '@/components/admin/ArtworkForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Artwork {
  id: string;
  title: string;
  title_en: string;
  description?: string | null;
  description_en?: string | null;
  image_url: string;
  price: number;
  price_usd: number;
  status: string;
  dimensions: string;
  medium?: string | null;
  medium_en?: string | null;
  year?: number | null;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

export default function Admin() {
  const { language, t } = useLanguage();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('artworks');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch artworks
    const { data: artworksData } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (artworksData) setArtworks(artworksData);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (ordersData) setOrders(ordersData);
    
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
  };

  const stats = {
    totalSales: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.order_status === 'pending').length,
  };

  const formatPrice = (amount: number) => {
    return language === 'ru' 
      ? `${amount.toLocaleString('ru-RU')} ₽`
      : `$${Math.round(amount / 90).toLocaleString('en-US')}`;
  };

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                {user?.email}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-light">
                {t.admin.title}
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="gap-2 self-start md:self-auto"
            >
              <LogOut className="w-4 h-4" />
              {t.admin.signOut}
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 border border-border bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">{t.admin.totalSales}</p>
                  <p className="text-2xl font-serif">{formatPrice(stats.totalSales)}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 border border-border bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">{t.admin.totalOrders}</p>
                  <p className="text-2xl font-serif">{stats.totalOrders}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 border border-border bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary flex items-center justify-center">
                  <Image className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">{t.admin.pendingOrders}</p>
                  <p className="text-2xl font-serif">{stats.pendingOrders}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-secondary/50">
              <TabsTrigger value="artworks" className="data-[state=active]:bg-background">
                {t.admin.artworks}
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-background">
                {t.admin.orders}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="artworks">
              <div className="flex justify-end mb-6">
                <Button 
                  className="gap-2"
                  onClick={() => {
                    setEditingArtwork(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-xs">{t.admin.addArtwork}</span>
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : artworks.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No artworks yet. Add your first artwork to get started.
                </div>
              ) : (
                <div className="border border-border bg-card overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Image</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Title</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Price</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="text-right p-4 text-xs font-medium uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artworks.map((artwork) => {
                        const title = language === 'ru' ? artwork.title : artwork.title_en;
                        const price = language === 'ru'
                          ? `${artwork.price.toLocaleString('ru-RU')} ₽`
                          : `$${artwork.price_usd.toLocaleString('en-US')}`;

                        return (
                          <tr key={artwork.id} className="border-t border-border">
                            <td className="p-4">
                              <div className="w-12 h-16 bg-muted overflow-hidden">
                                <img
                                  src={artwork.image_url}
                                  alt={title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                            <td className="p-4 font-serif">{title}</td>
                            <td className="p-4">{price}</td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase tracking-wider px-2 py-1 ${
                                artwork.status === 'sold' 
                                  ? 'bg-muted text-muted-foreground' 
                                  : 'bg-foreground text-background'
                              }`}>
                                {artwork.status === 'sold' ? t.gallery.sold : t.gallery.forSale}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingArtwork(artwork);
                                    setFormOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setArtworkToDelete(artwork);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <div className="border border-border bg-card overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Order ID</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Customer</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Amount</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Status</th>
                        <th className="text-left p-4 text-xs font-medium uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-border">
                          <td className="p-4 font-mono text-sm">{order.id.slice(0, 8)}</td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                            </div>
                          </td>
                          <td className="p-4">{formatPrice(order.total_amount)}</td>
                          <td className="p-4">
                            <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-secondary">
                              {order.order_status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Artwork Form Dialog */}
          <ArtworkForm
            open={formOpen}
            onOpenChange={setFormOpen}
            artwork={editingArtwork}
            onSuccess={fetchData}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{language === 'ru' ? artworkToDelete?.title : artworkToDelete?.title_en}"? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    if (!artworkToDelete) return;
                    setDeleting(true);
                    try {
                      const { error } = await supabase
                        .from('artworks')
                        .delete()
                        .eq('id', artworkToDelete.id);
                      
                      if (error) throw error;
                      toast({ title: 'Artwork deleted successfully' });
                      fetchData();
                    } catch (error) {
                      console.error('Delete error:', error);
                      toast({ title: 'Failed to delete artwork', variant: 'destructive' });
                    } finally {
                      setDeleting(false);
                      setDeleteDialogOpen(false);
                      setArtworkToDelete(null);
                    }
                  }}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>
    </Layout>
  );
}
