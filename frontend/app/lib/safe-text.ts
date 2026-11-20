/**
 * Cleans untrusted text before it is used in the interface.
 *
 * React renders returned strings as text, not HTML, which provides output
 * encoding. This helper additionally removes invisible control characters and
 * keeps values within a practical display/search limit.
 */
export function cleanUserText(value: string, maxLength = 500): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}
