export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // Navigation
    nav: {
      gallery: 'Галерея',
      about: 'О художнике',
      cart: 'Корзина',
      admin: 'Админ',
    },
    // Hero
    hero: {
      title: 'Luna Gallery',
      subtitle: 'Коллекция уникальных художественных работ',
      cta: 'Смотреть галерею',
    },
    // Gallery
    gallery: {
      title: 'Галерея работ',
      filterAll: 'Все',
      filterStyle: 'Стиль',
      filterSize: 'Размер',
      filterPrice: 'Цена',
      sold: 'Продано',
      forSale: 'В продаже',
      addToCart: 'В корзину',
      viewDetails: 'Подробнее',
    },
    // Filters
    filters: {
      all: 'Все',
      abstract: 'Абстракция',
      portrait: 'Портрет',
      landscape: 'Пейзаж',
      modern: 'Модерн',
      small: 'Малый',
      medium: 'Средний',
      large: 'Большой',
      priceAsc: 'Цена ↑',
      priceDesc: 'Цена ↓',
    },
    // Cart
    cart: {
      title: 'Корзина',
      empty: 'Корзина пуста',
      total: 'Итого',
      shipping: 'Доставка',
      checkout: 'Оформить заказ',
      remove: 'Удалить',
      continueShopping: 'Продолжить покупки',
    },
    // Checkout
    checkout: {
      title: 'Оформление заказа',
      shippingInfo: 'Информация о доставке',
      paymentMethod: 'Способ оплаты',
      card: 'Банковская карта',
      crypto: 'Криптовалюта',
      installment: 'Рассрочка',
      placeOrder: 'Разместить заказ',
    },
    // Footer
    footer: {
      rights: 'Все права защищены',
      privacy: 'Политика конфиденциальности',
      terms: 'Условия использования',
      contact: 'Связаться',
    },
    // Admin
    admin: {
      title: 'Панель управления',
      artworks: 'Работы',
      orders: 'Заказы',
      stats: 'Статистика',
      addArtwork: 'Добавить работу',
      editArtwork: 'Редактировать',
      deleteArtwork: 'Удалить',
      totalSales: 'Продажи',
      totalOrders: 'Заказы',
      pendingOrders: 'Ожидают',
    },
    // Common
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      save: 'Сохранить',
      currency: '₽',
    },
  },
  en: {
    // Navigation
    nav: {
      gallery: 'Gallery',
      about: 'About',
      cart: 'Cart',
      admin: 'Admin',
    },
    // Hero
    hero: {
      title: 'Luna Gallery',
      subtitle: 'Collection of unique artworks',
      cta: 'View Gallery',
    },
    // Gallery
    gallery: {
      title: 'Gallery',
      filterAll: 'All',
      filterStyle: 'Style',
      filterSize: 'Size',
      filterPrice: 'Price',
      sold: 'Sold',
      forSale: 'For Sale',
      addToCart: 'Add to Cart',
      viewDetails: 'View Details',
    },
    // Filters
    filters: {
      all: 'All',
      abstract: 'Abstract',
      portrait: 'Portrait',
      landscape: 'Landscape',
      modern: 'Modern',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      priceAsc: 'Price ↑',
      priceDesc: 'Price ↓',
    },
    // Cart
    cart: {
      title: 'Cart',
      empty: 'Your cart is empty',
      total: 'Total',
      shipping: 'Shipping',
      checkout: 'Checkout',
      remove: 'Remove',
      continueShopping: 'Continue Shopping',
    },
    // Checkout
    checkout: {
      title: 'Checkout',
      shippingInfo: 'Shipping Information',
      paymentMethod: 'Payment Method',
      card: 'Credit Card',
      crypto: 'Cryptocurrency',
      installment: 'Installment',
      placeOrder: 'Place Order',
    },
    // Footer
    footer: {
      rights: 'All rights reserved',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact',
    },
    // Admin
    admin: {
      title: 'Admin Panel',
      artworks: 'Artworks',
      orders: 'Orders',
      stats: 'Statistics',
      addArtwork: 'Add Artwork',
      editArtwork: 'Edit',
      deleteArtwork: 'Delete',
      totalSales: 'Sales',
      totalOrders: 'Orders',
      pendingOrders: 'Pending',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      currency: '$',
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;
