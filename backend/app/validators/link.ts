import vine from '@vinejs/vine'

// Rules for link fields shared by LinksController and the unit tests.
// Slugs may contain letters, numbers, hyphens, underscores, and slashes.
export const SLUG_PATTERN = /^[a-zA-Z0-9-_/]+$/
export const MAX_TITLE_LENGTH = 255
export const HTTP_URL_PATTERN = /^https?:\/\/[^\s]+$/i

/* VineJS schema for a shortcut alias (the part after go/).
 The value is trimmed first, then matched against SLUG_PATTERN.
 A function so each caller gets a fresh schema object.
*/
export const linkSlugSchema = () => vine.string().trim().regex(SLUG_PATTERN)

/* VineJS schema for the URL a shortcut redirects to.
 The value is trimmed, must be well-formed, and may only use the HTTP or HTTPS
 schemes. This prevents stored links from using executable URL schemes such as
 javascript: or data: when rendered by the dashboard.
*/
export const destinationUrlSchema = () => vine.string().trim().url().regex(HTTP_URL_PATTERN)

export const linkTitleSchema = () => vine.string().trim().maxLength(MAX_TITLE_LENGTH)
