// Підписи полів в адмінці. Ключ — імʼя поля у схемі, тож API та код
// і далі працюють з англійськими назвами: міняється лише відображення.
const FIELD_LABELS: Record<string, string> = {
  // Товар
  name: 'Назва',
  subtitleMode: 'Тип підзаголовка',
  subtitle: 'Підзаголовок',
  image: 'Фото',
  priceMode: 'Тип ціни',
  price: 'Ціна',
  discountPercent: 'Знижка, %',
  discountedPrice: 'Ціна зі знижкою',
  stock: 'Кількість на складі',
  badges: 'Мітки',
  variations: 'Варіації',
  categories: 'Категорії',

  // Варіації
  label: 'Назва варіанта',
  values: 'Варіанти',
  priceOverride: 'Ціна варіанта',
  subLabel: 'Назва вкладеної групи',
  subValues: 'Вкладені варіанти',

  // Категорії та мітки
  slug: 'Ідентифікатор',
  order: 'Порядок',

  // Замовлення
  customerName: 'Імʼя покупця',
  phone: 'Телефон',
  email: 'Email',
  comment: 'Коментар',
  status: 'Статус',
  items: 'Позиції',
  total: 'Сума',
  product: 'Товар',
  productName: 'Назва товару',
  options: 'Обрані варіанти',
  quantity: 'Кількість',
  unitPrice: 'Ціна за одиницю',

  // Промокоди
  code: 'Промокод',
  minimumSubtotal: 'Мінімальна сума замовлення',

  // Смуга оголошень
  text: 'Текст',
  messages: 'Повідомлення',
};

// Content Manager шукає підписи полів за повним ID моделі, а не лише
// за назвою атрибута. Ці ключі працюють і в таблиці, і у формі запису.
const PROMO_CODE_LABELS: Record<string, string> = {
  'content-manager.content-types.api::promo-code.promo-code.code': 'Промокод',
  'content-manager.content-types.api::promo-code.promo-code.discountPercent': 'Знижка, %',
  'content-manager.content-types.api::promo-code.promo-code.enabled': 'Активний',
  'content-manager.content-types.api::promo-code.promo-code.minimumSubtotal': 'Мінімальна сума замовлення',
  'content-manager.content-types.api::promo-code.promo-code.startsAt': 'Діє з',
  'content-manager.content-types.api::promo-code.promo-code.expiresAt': 'Діє до',
  'content-manager.content-types.api::promo-code.promo-code.singleUse': 'Одноразовий',
  'content-manager.content-types.api::promo-code.promo-code.usedAt': 'Дата використання',
};

const TRANSLATIONS = { ...FIELD_LABELS, ...PROMO_CODE_LABELS };

export default {
  config: {
    locales: ['uk'],
    // Підписи задаємо для обох локалей: адмінка може лишатися англійською.
    translations: {
      uk: TRANSLATIONS,
      en: TRANSLATIONS,
    },
  },
  bootstrap() {},
};
