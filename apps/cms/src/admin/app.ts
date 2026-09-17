// Підписи полів в адмінці. Ключ — імʼя поля у схемі, тож API та код
// і далі працюють з англійськими назвами: міняється лише відображення.
const FIELD_LABELS: Record<string, string> = {
  // Товар
  name: 'Назва',
  volumeMode: 'Тип ємності',
  volume: 'Ємність',
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

  // Смуга оголошень
  text: 'Текст',
  messages: 'Повідомлення',
};

export default {
  config: {
    locales: ['uk'],
    // Підписи задаємо для обох локалей: адмінка може лишатися англійською.
    translations: {
      uk: FIELD_LABELS,
      en: FIELD_LABELS,
    },
  },
  bootstrap() {},
};
