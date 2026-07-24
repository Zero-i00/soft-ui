import { themeService } from './use-theme.service'

/**
 * Inline-скрипт для <head>. Предотвращает вспышку неправильной темы (FOIF).
 *
 * Использование (Next.js App Router):
 *   import { themeScript } from "@soft-ui/hooks";
 *   <head>
 *     <script dangerouslySetInnerHTML={{ __html: themeScript }} />
 *   </head>
 */
export const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem(${JSON.stringify(themeService.STORAGE_KEY)});
    var prefersDark = window.matchMedia(${JSON.stringify(themeService.PREFER)}).matches;
    var theme = stored === "dark" || stored === "light"
      ? stored
      : (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute(${JSON.stringify(themeService.ATTRIBUTE)}, theme);
  } catch (e) {}
})();
`.trim()
