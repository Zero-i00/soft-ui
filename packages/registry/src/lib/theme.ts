import { ATTRIBUTE, PREFER, STORAGE_KEY } from '../services/theme.service'

/**
 * Inline-скрипт для <head>. Предотвращает вспышку неправильной темы (FOIF).
 *
 * Использование (Next.js App Router):
 *   import { themeScript } from "@/lib/theme-script";
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 *   </head>
 */
export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var prefersDark = window.matchMedia(${JSON.stringify(PREFER)}).matches;
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute(${JSON.stringify(ATTRIBUTE)}, theme);
  } catch (e) {}
})();
`.trim()
