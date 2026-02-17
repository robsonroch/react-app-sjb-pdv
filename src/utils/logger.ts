export const debugLog = (label: string, data?: unknown) => {
  if (!import.meta.env.DEV) {
    return;
  }

  if (data === undefined) {
    console.debug(`[debug] ${label}`);
    return;
  }

  console.debug(`[debug] ${label}`, data);
};
