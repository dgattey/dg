/**
 * Error subclass with enumerable properties for better logging.
 * Standard Error properties are non-enumerable, so they don't show in JSON/logs.
 */
export class MaskedError extends Error {
  constructor(message: string, name: string, stack?: string) {
    super(message);
    this.name = name;
    if (stack) {
      this.stack = stack;
    }
    // Make properties enumerable so they show in logs
    Object.defineProperties(this, {
      message: { enumerable: true, value: message },
      name: { enumerable: true, value: name },
      stack: { enumerable: true, value: stack },
    });
  }
}
