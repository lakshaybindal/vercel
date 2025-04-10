export function generate() {
  const randomId = Math.random().toString(36).substring(2, 10);
  return randomId;
}
