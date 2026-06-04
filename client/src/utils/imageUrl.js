export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const clean = path.replace(/^\//, '');
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${clean}`;
}
