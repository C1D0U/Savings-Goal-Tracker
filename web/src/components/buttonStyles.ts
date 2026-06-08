export const PRIMARY_BUTTON_CLASS =
  'inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition hover:bg-blue-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60';

export function primaryButtonClassName(extra = '') {
  return [PRIMARY_BUTTON_CLASS, extra].filter(Boolean).join(' ');
}

