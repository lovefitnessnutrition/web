/**
 * Construye un enlace de WhatsApp.
 * @param number  Número en formato E164 sin "+" (ej. "34600111222")
 * @param text    Mensaje opcional pre-rellenado
 */
export function buildWhatsAppLink(number: string, text?: string): string {
  const base = `https://wa.me/${number}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}
