import DOMPurify from "dompurify"
export const sanitize = (value) => DOMPurify.sanitize(value)
