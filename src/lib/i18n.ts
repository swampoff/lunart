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
      viewSlider: 'Слайдер',
      noArtworks: 'Работы не найдены',
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
      name: 'Имя',
      email: 'Email',
      phone: 'Телефон',
      address: 'Адрес',
      city: 'Город',
      postalCode: 'Индекс',
      country: 'Страна',
      orderSummary: 'Детали заказа',
      orderPlaced: 'Заказ оформлен!',
    },
    // Home
    home: {
      featuredWorks: 'Избранные работы',
      viewAll: 'Смотреть все',
      aboutArtist: 'О художнике',
      artistTitle: 'Искусство, которое говорит',
      artistDescription: 'Каждая работа в коллекции Luna — уникальное выражение эмоций, цвета и формы. С влияниями современного и абстрактного искусства, эти работы приглашают вас остановиться и поразмышлять.',
      learnMore: 'Узнать больше',
    },
    // About
    about: {
      title: 'О художнике',
      subtitle: 'Фотограф и визуальный рассказчик',
      email: 'Email',
      location: 'Местоположение',
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
      signOut: 'Выйти',
    },
    // Auth
    auth: {
      signIn: 'Войти',
      signUp: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      backToGallery: 'Назад в галерею',
      adminPanel: 'Админ-панель',
      noAccount: 'Нет аккаунта? Зарегистрируйтесь',
      hasAccount: 'Уже есть аккаунт? Войдите',
    },
    // Common
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      success: 'Успешно',
      cancel: 'Отмена',
      save: 'Сохранить',
      currency: '₽',
      year: 'Год',
      notFound: 'Не найдено',
      addedToCart: 'Добавлено в корзину',
    },
    // NotFound
    notFound: {
      title: 'Страница не найдена',
      description: 'Страница, которую вы ищете, не существует или была перемещена.',
      returnHome: 'Вернуться на главную',
    },
    // ArtworkDetail
    artworkDetail: {
      artworkNotFound: 'Работа не найдена',
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
      viewSlider: 'Slider',
      noArtworks: 'No artworks found',
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
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      orderSummary: 'Order Summary',
      orderPlaced: 'Order placed!',
    },
    // Home
    home: {
      featuredWorks: 'Featured Works',
      viewAll: 'View All',
      aboutArtist: 'About the Artist',
      artistTitle: 'Creating Art That Speaks',
      artistDescription: 'Each piece in the Luna collection is a unique expression of emotion, color, and form. With influences from contemporary and abstract movements, these works invite you to pause and reflect.',
      learnMore: 'Learn More',
    },
    // About
    about: {
      title: 'About',
      subtitle: 'Photographer & Visual Storyteller',
      email: 'Email',
      location: 'Location',
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
      signOut: 'Sign Out',
    },
    // Auth
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      backToGallery: 'Back to Gallery',
      adminPanel: 'Admin Panel',
      noAccount: "Don't have an account? Sign up",
      hasAccount: 'Already have an account? Sign in',
    },
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      currency: '$',
      year: 'Year',
      notFound: 'Not Found',
      addedToCart: 'Added to cart',
    },
    // NotFound
    notFound: {
      title: 'Page Not Found',
      description: "The page you're looking for doesn't exist or has been moved.",
      returnHome: 'Return to Home',
    },
    // ArtworkDetail
    artworkDetail: {
      artworkNotFound: 'Artwork not found',
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;
