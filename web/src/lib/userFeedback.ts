export function friendlyError(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error || '');

  if (!message || message.length > 160 || message.trim().startsWith('{')) {
    return fallback;
  }

  return message;
}
