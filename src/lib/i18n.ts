export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // Navigation
    nav: {
      gallery: 'Галерея',
      about: 'О художнике',
      cart: 'Корзина',
      admin: 'Админ',
      contact: 'Контакты',
      portfolio: 'Портфолио',
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
      name: 'Сара Митчелл',
      tagline: 'Редакционный и коммерческий фотограф',
      biography1: 'Сара Митчелл — отмеченный наградами фотограф, специализирующийся на редакционной и коммерческой съёмке. Среди её достижений — награда International Photography Awards как Редакционный Фотограф Года 2023 и победа в PDN Photo Annual 2022. С более чем десятилетним опытом, её работы публиковались во многих международных изданиях и выставках, она сотрудничала с такими клиентами, как Vogue, The New York Times, National Geographic, Adobe, Apple, Nike и Architectural Digest.',
      biography2: 'Живёт в Нью-Йорке, имеет степень магистра изящных искусств в области фотографии Школы Визуальных Искусств. Сара привносит уникальный взгляд в каждый проект, сочетая техническое мастерство с художественным видением. Её подход к фотографии глубоко укоренён в сторителлинге — она верит, что каждое изображение должно передавать эмоции и смысл, выходящие за рамки визуальной привлекательности.',
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
      createAccount: 'Создать аккаунт',
      pleaseWait: 'Подождите...',
      signInToAdmin: 'Вход в админ-панель',
      createAdminAccount: 'Создание аккаунта',
      validationError: 'Ошибка валидации',
      invalidEmail: 'Введите корректный email',
      passwordMinLength: 'Пароль должен быть минимум 6 символов',
      invalidCredentials: 'Неверный email или пароль',
      emailAlreadyRegistered: 'Этот email уже зарегистрирован. Войдите.',
      accountCreated: 'Аккаунт создан',
      accountCreatedDesc: 'Теперь вы можете войти с вашими данными.',
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
    // Contact
    contact: {
      title: 'Связаться',
      subtitle: 'Обсудим ваш проект',
      sendMessage: 'Отправить сообщение',
      formDescription: 'Заполните форму и я отвечу в течение 24-48 часов.',
      contactInfo: 'Контактная информация',
      contactInfoDesc: 'Предпочитаете связаться напрямую? Вот как это сделать.',
      email: 'Email',
      phone: 'Телефон',
      location: 'Местоположение',
    },
    // Portfolio
    portfolio: {
      title: 'Портфолио',
      subtitle: 'Коллекция фотографий разных жанров и стилей',
      camera: 'Камера',
      client: 'Клиент',
    },
  },
  en: {
    // Navigation
    nav: {
      gallery: 'Gallery',
      about: 'About',
      cart: 'Cart',
      admin: 'Admin',
      contact: 'Contact',
      portfolio: 'Portfolio',
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
      name: 'Sarah Mitchell',
      tagline: 'Editorial & Commercial Photographer',
      biography1: 'Sarah Mitchell is an award-winning photographer specializing in editorial and commercial work, with recognition including the International Photography Awards Editorial Photographer of the Year 2023 and PDN Photo Annual Winner 2022. With over a decade of experience, her work has been featured in numerous international publications and exhibitions, collaborating with clients such as Vogue, The New York Times, National Geographic, Adobe, Apple, Nike, and Architectural Digest.',
      biography2: 'Based in New York with an MFA in Photography from the School of Visual Arts, Sarah brings a unique perspective to every project, combining technical excellence with artistic vision. Her approach to photography is deeply rooted in storytelling, believing that every image should convey emotion and meaning beyond its visual appeal.',
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
      createAccount: 'Create Account',
      pleaseWait: 'Please wait...',
      signInToAdmin: 'Sign in to Admin Panel',
      createAdminAccount: 'Create Admin Account',
      validationError: 'Validation Error',
      invalidEmail: 'Please enter a valid email address',
      passwordMinLength: 'Password must be at least 6 characters',
      invalidCredentials: 'Invalid email or password',
      emailAlreadyRegistered: 'This email is already registered. Please sign in.',
      accountCreated: 'Account Created',
      accountCreatedDesc: 'You can now sign in with your credentials.',
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
    // Contact
    contact: {
      title: 'Contact',
      subtitle: "Let's discuss your next project",
      sendMessage: 'Send a Message',
      formDescription: "Fill out the form below and I'll get back to you within 24-48 hours.",
      contactInfo: 'Contact Information',
      contactInfoDesc: "Prefer to reach out directly? Here's how you can contact me.",
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
    },
    // Portfolio
    portfolio: {
      title: 'Portfolio',
      subtitle: 'A curated collection of photography spanning diverse subjects and styles',
      camera: 'Camera',
      client: 'Client',
    },
  },
} as const;

export type TranslationKeys = typeof translations.en;
