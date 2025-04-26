declare global {
  interface Window {
    scrollTimer?: NodeJS.Timeout;
  }
}

export {};
