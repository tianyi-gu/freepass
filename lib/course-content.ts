export function courseLink(course: { web_link?: string | null; video_link?: string | null; description?: string | null }): string | null {
  const explicit = course.web_link?.trim() || course.video_link?.trim();
  if (explicit) return explicit;
  const description = course.description?.trim() ?? '';
  if (!/^https?:\/\/\S+$/i.test(description)) return null;
  try { const url = new URL(description); return url.username || url.password ? null : url.href; } catch { return null; }
}
