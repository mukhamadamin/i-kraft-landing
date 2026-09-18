/* Логотип импортируется как модуль: Vite сам подставит путь с учётом base
   и добавит хеш для сброса кеша. Строка "/assets/kraft.svg" этого не даёт
   и ломается при развёртывании в подкаталог (GitHub Pages). */
import kraftLogo from "../assets/kraft.svg";
/* Тот же логотип с тёмной надписью — для светлой темы; сумка на кругах
   остаётся белой, как в оригинале */
import kraftLogoLight from "../assets/kraft-light.svg";

export { kraftLogo, kraftLogoLight };
