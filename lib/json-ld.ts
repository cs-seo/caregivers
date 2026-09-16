// Serialize structured data for embedding inside a <script type="application/ld+json">.
//
// The input can contain user-controlled fields (job titles/descriptions, carer
// names). A naive JSON.stringify would let a value like "</script><script>"
// terminate the tag and inject markup — a stored-XSS vector. We escape every
// character that is meaningful inside an HTML <script> context, plus the JS line
// separators U+2028/U+2029, so the payload can never break out of the tag.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
