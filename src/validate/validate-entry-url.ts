export function validateEntryUrl(url: string): void {
  if (!url.startsWith("/")) {
    throw new Error(`Invalid url: ${url}`);
  }

  if (url.includes("?") || url.includes("#")) {
    throw new Error(`Invalid url (no query/fragment): ${url}`);
  }
}
