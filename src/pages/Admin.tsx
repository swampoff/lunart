import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockArtworks } from '@/data/mockArtworks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Package, BarChart3, Image } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('artworks');

  const stats = {
    totalSales: language === 'ru' ? '385 000 ₽' : '$4,280',
    totalOrders: 12,
    pendingOrders: 3,
  };

  return (
    <Layout>
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold">
              {t.admin.title}
            </h1>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 border border-border rounded-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.totalSales}</p>
                  <p className="text-2xl font-bold">{stats.totalSales}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border border-border rounded-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.totalOrders}</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border border-border rounded-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.pendingOrders}</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="artworks">{t.admin.artworks}</TabsTrigger>
              <TabsTrigger value="orders">{t.admin.orders}</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks">
              <div className="flex justify-end mb-6">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t.admin.addArtwork}
                </Button>
              </div>

              <div className="border border-border rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Image</th>
                      <th className="text-left p-4 text-sm font-medium">Title</th>
                      <th className="text-left p-4 text-sm font-medium">Price</th>
                      <th className="text-left p-4 text-sm font-medium">Status</th>
                      <th className="text-right p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockArtworks.map((artwork) => {
                      const title = language === 'ru' ? artwork.title : artwork.titleEn;
                      const price = language === 'ru'
                        ? `${artwork.price.toLocaleString('ru-RU')} ₽`
                        : `$${artwork.priceUsd.toLocaleString('en-US')}`;

                      return (
                        <tr key={artwork.id} className="border-t border-border">
                          <td className="p-4">
                            <img
                              src={artwork.imageUrl}
                              alt={title}
                              className="w-12 h-16 object-cover"
                            />
                          </td>
                          <td className="p-4">{title}</td>
                          <td className="p-4">{price}</td>
                          <td className="p-4">
                            <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                              artwork.status === 'sold' 
                                ? 'bg-muted text-muted-foreground' 
                                : 'bg-primary text-primary-foreground'
                            }`}>
                              {artwork.status === 'sold' ? t.gallery.sold : t.gallery.forSale}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
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
            </TabsContent>

            <TabsContent value="orders">
              <div className="text-center py-12 text-muted-foreground">
                No orders yet
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
