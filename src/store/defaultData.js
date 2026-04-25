export const defaultState = {
  settings: {
    companyName: "I-Kraft-Pack",
    slogan: "Крафтовая упаковка, которая продает",
    phone: "+998 90 123 45 67",
    email: "sales@ikraftpack.uz",
    address: "Ташкент, Юнусабадский район",
    telegram: "@ikraftpack",
    whatsapp: "+998901234567",
    heroTitle: "Упаковка для лаваша, бургера и фри под ваш бренд",
    heroSubtitle:
      "Производим крафтовые пакеты и пергамент с фирменной печатью. Быстрые сроки, аккуратный цвет и стабильное качество от партии к партии.",
  },
  categories: [
    {
      id: "cat_lavash",
      title: "Лаваш",
      slug: "lavash",
      description: "Упаковка для роллов, донеров и лаваша: плотная бумага и чистая склейка.",
      image: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "cat_burger",
      title: "Бургеры",
      slug: "burger",
      description: "Крафтовые пакеты и обертка для бургеров с жиростойким слоем.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "cat_fries",
      title: "Фри",
      slug: "fries",
      description: "Форматы под картофель фри: от мини до XL с логотипом бренда.",
      image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "cat_paper",
      title: "Пергамент",
      slug: "pergament",
      description: "Пищевая бумага и пергамент с паттерн-печатью для фастфуда.",
      image: "https://images.unsplash.com/photo-1585222381486-1a5d6ddf8b35?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  products: [
    {
      id: "prd_lavash_01",
      title: "Крафт-конверт Lavash Pro",
      categoryId: "cat_lavash",
      summary: "Удобная посадка под роллы и донер, защита от размокания.",
      description:
        "Формат разработан для заведений с большим потоком. Бумага плотностью 70-90 г/м2, проклейка пищевым клеем, можно печатать до 2 цветов.",
      specs: "Размер: 12x24 см; Материал: крафт + барьерный слой; Печать: до 2 цветов",
      minOrder: "От 5 000 шт",
      tags: "lavaш, street-food, донер",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "prd_burger_01",
      title: "Burger Bag Signature",
      categoryId: "cat_burger",
      summary: "Пакет с широким лицом под фирменный логотип.",
      description:
        "Подходит для бургерных и dark kitchen. Доступны размеры S/M/L, ровная печать и устойчивая геометрия шва.",
      specs: "Размер: 16x18 см; Материал: крафт 80 г/м2; Печать: 1-3 цвета",
      minOrder: "От 3 000 шт",
      tags: "burger, take-away",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "prd_fries_01",
      title: "Fries Pocket Air",
      categoryId: "cat_fries",
      summary: "Форма для фри с комфортным захватом и вентиляцией.",
      description:
        "Упаковка держит форму, не теряет внешний вид в доставке и подходит под вертикальную выкладку на витрине.",
      specs: "Размер: 9x15 см; Материал: крафт 70 г/м2; Печать: 1-2 цвета",
      minOrder: "От 4 000 шт",
      tags: "fries, delivery",
      image: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "prd_paper_01",
      title: "Пергамент PatternWrap",
      categoryId: "cat_paper",
      summary: "Фирменный паттерн и логотип по всей плоскости.",
      description:
        "Подходит для бургеров, лаваша и десертов. Доступна печать паттерном и брендированными блоками контактов.",
      specs: "Размер: 30x30 см; Материал: пищевой пергамент; Печать: до 2 цветов",
      minOrder: "От 10 кг",
      tags: "пергамент, обертка, бренд",
      image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1400&q=80",
    },
  ],
  news: [
    {
      id: "news_2026_01",
      title: "Запустили новую линию печати для крафта",
      date: "2026-02-18",
      excerpt: "Повысили скорость выпуска и улучшили точность цветопередачи логотипов.",
      content:
        "Мы ввели в работу новую печатную линию, которая позволяет выпускать большие тиражи стабильного качества.\nТеперь мы быстрее обрабатываем срочные заказы и точнее передаем фирменные цвета бренда.\nДля клиентов это означает меньше итераций на согласование и более короткий цикл от макета до поставки.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "news_2026_02",
      title: "Открыли шоурум образцов упаковки",
      date: "2026-01-25",
      excerpt: "Можно посмотреть реальные материалы и сравнить варианты перед запуском тиража.",
      content:
        "В шоуруме представлены пакеты, пергамент и обертка в разных форматах.\nКоманда помогает подобрать плотность, формат и тип печати под вашу задачу.\nЗапись на встречу доступна по телефону и в Telegram.",
      image: "https://images.unsplash.com/photo-1524758870432-af57e54afa26?auto=format&fit=crop&w=1400&q=80",
    },
  ],
  posts: [
    {
      id: "post_guide_branding",
      title: "Как сделать упаковку, которую фотографируют в соцсетях",
      date: "2026-03-05",
      author: "Команда I-Kraft-Pack",
      readTime: "6 мин",
      excerpt: "Практический разбор композиции логотипа, контраста и читаемости на крафте.",
      content:
        "Упаковка давно стала частью контента.\nЧтобы бренд замечали, важно не только поставить логотип, но и правильно расположить его в композиции.\nИспользуйте контрастные цвета, оставляйте воздух вокруг знака и проверяйте читаемость с расстояния 1-1.5 метра.\nДля пергамента хорошо работает повторяемый паттерн с редкими акцентами контактной информации.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "post_cost_control",
      title: "5 способов снизить себестоимость упаковки без потери качества",
      date: "2026-02-10",
      author: "Технологический отдел",
      readTime: "8 мин",
      excerpt: "Оптимизация размеров, форматов печати и логистики для сетей доставки.",
      content:
        "Экономия начинается с правильного техзадания.\nЕсли стандартизировать 2-3 формата и заранее планировать тираж, можно существенно снизить стоимость единицы.\nТакже важно выбирать оптимальную плотность бумаги под конкретный продукт, а не брать избыточный запас.\nРекомендуем регулярно пересматривать упаковочную матрицу вместе с производителем.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
    },
  ],
  clients: [
    {
      id: "cl_fastbite",
      name: "FastBite",
      industry: "Сеть бургерных",
      about: "20 точек в городе, фокус на доставке и узнаваемом бренде.",
      website: "https://example.com",
      logo: "",
    },
    {
      id: "cl_lavashcity",
      name: "Lavash City",
      industry: "Street-food",
      about: "Лидирующая сеть по продаже лаваша и донеров.",
      website: "https://example.com",
      logo: "",
    },
    {
      id: "cl_friespoint",
      name: "Fries Point",
      industry: "Fast casual",
      about: "Монопродукт картофель фри, акцент на визуал упаковки.",
      website: "https://example.com",
      logo: "",
    },
  ],
  works: [
    {
      id: "work_fastbite_rebrand",
      title: "Ребрендинг упаковки FastBite",
      date: "2026-01-12",
      clientId: "cl_fastbite",
      categoryId: "cat_burger",
      challenge:
        "Старый пакет терял цвет после печати, а логотип выглядел тускло на крафтовой основе.",
      solution:
        "Переработали композицию логотипа, усилили контраст и подобрали новую плотность бумаги.",
      result: "Рост узнаваемости бренда в доставке и снижение брака на 28%.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "work_lavashcity_pattern",
      title: "Паттерн-пергамент для Lavash City",
      date: "2025-12-03",
      clientId: "cl_lavashcity",
      categoryId: "cat_paper",
      challenge:
        "Нужно было совместить эстетичный паттерн и заметные контакты доставки на обертке.",
      solution:
        "Сделали двухуровневую графику: мелкий паттерн + акцентные контактные блоки.",
      result: "Рост повторных заказов упаковки и сильный визуальный эффект в соцсетях.",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80",
    },
  ],
};
