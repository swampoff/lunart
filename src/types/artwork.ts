export type ArtworkStyle = 'abstract' | 'portrait' | 'landscape' | 'modern';
export type ArtworkSize = 'small' | 'medium' | 'large';
export type ArtworkStatus = 'for_sale' | 'sold';

export interface Artwork {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: number;
  priceUsd: number;
  style: ArtworkStyle;
  size: ArtworkSize;
  dimensions: string;
  imageUrl: string;
  videoUrl?: string;
  status: ArtworkStatus;
  createdAt: string;
  year: number;
}

export interface Order {
  id: string;
  artworkIds: string[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  country: string;
  paymentMethod: 'card' | 'crypto' | 'installment';
  totalAmount: number;
  currency: 'RUB' | 'USD';
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  trackingNumber?: string;
}
