export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withMinimumDelay<T>(promise: Promise<T>, ms = 300) {
  return Promise.all([promise, sleep(ms)]).then(([result]) => result);
}
