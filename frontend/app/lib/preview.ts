export function createPreviewLink(destination: string, keyword: string): string {
  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    throw new Error("Enter a valid destination URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Use an http or https URL.");
  }

  const slug = keyword.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 32) {
    throw new Error("Use 1–32 letters, numbers, or single hyphens.");
  }

  return `go/${slug}`;
}
