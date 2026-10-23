/**
 * Security: Sanitize all text inputs against XSS injection before storing them in state.
 * TRD Non-Functional Requirement:
 * "Sanitize all text inputs against XSS injection before storing them in state."
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Strips dangerous HTML tags, malicious attributes, and script protocols,
 * then safely encodes dangerous characters.
 */
export function sanitizeInput(raw: unknown): string {
  if (typeof raw !== 'string') {
    if (raw === null || raw === undefined) return '';
    return String(raw);
  }

  let cleaned = raw;

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Strip script blocks and other active content completely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  cleaned = cleaned.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  cleaned = cleaned.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Strip inline javascript: and vbscript: URLs
  cleaned = cleaned.replace(/javascript\s*:/gi, '');
  cleaned = cleaned.replace(/vbscript\s*:/gi, '');
  cleaned = cleaned.replace(/data\s*:\s*text\/html/gi, '');

  // Strip event handler attributes (e.g. onerror=, onload=, onclick=)
  cleaned = cleaned.replace(/\bon\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // Strip any remaining HTML opening and closing tags (leaving pure text)
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');

  // Escape special characters to neutralize any leftover payload
  cleaned = cleaned.replace(/[&<>"'`/]/g, (char) => HTML_ENTITY_MAP[char] || char);

  return cleaned.trim();
}

/**
 * Recursively sanitizes all string properties within an object or array.
 */
export function sanitizeObject<T>(input: T): T {
  if (typeof input === 'string') {
    return sanitizeInput(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeObject(item)) as unknown as T;
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return input;
}
