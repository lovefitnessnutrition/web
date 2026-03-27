/**
 * Construye un enlace de Telegram.
 * @param number  Número en formato E164 sin "+" (ej. "34600111222")
 */
export function buildTelegramLink(number: string): string {
  return `https://t.me/+${number}`;
}
