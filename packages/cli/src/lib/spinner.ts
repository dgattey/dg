import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export type SpinnerInstance = Ora;

/**
 * Create a spinner with a message
 */
export function createSpinner(text: string): SpinnerInstance {
  return ora({ color: 'cyan', text });
}

/**
 * Run a function with a spinner (supports both sync and async functions)
 */
export async function withSpinner<T>(
  text: string,
  fn: (spinner: SpinnerInstance) => T | Promise<T>,
  options?: { successText?: string; failText?: string },
): Promise<T> {
  const spinner = createSpinner(text).start();
  try {
    const result = await Promise.resolve(fn(spinner));
    spinner.succeed(options?.successText ?? text);
    return result;
  } catch (error) {
    spinner.fail(options?.failText ?? text);
    throw error;
  }
}

/**
 * Run multiple steps sequentially with spinners
 */
export async function withSteps<T>(
  steps: Array<{
    text: string;
    run: (spinner: SpinnerInstance) => unknown | Promise<unknown>;
    successText?: string;
  }>,
  finalResult: () => T,
): Promise<T> {
  for (const step of steps) {
    await withSpinner(step.text, step.run, { successText: step.successText });
  }
  return finalResult();
}

/**
 * Format output messages
 */
export const format = {
  bold: (text: string) => chalk.bold(text),
  dim: (text: string) => chalk.dim(text),
  error: (text: string) => chalk.red(`✗ ${text}`),
  info: (text: string) => chalk.blue(`ℹ ${text}`),
  link: (text: string, url: string) =>
    chalk.blue.underline(url) + (text !== url ? ` (${text})` : ''),
  success: (text: string) => chalk.green(`✓ ${text}`),
  warning: (text: string) => chalk.yellow(`⚠ ${text}`),
};

/**
 * Print a formatted message to stderr (for status messages that shouldn't interfere with output)
 */
export function log(message: string): void {
  // biome-ignore lint/suspicious/noConsole: CLI output to stderr
  console.error(message);
}

/**
 * Print to stdout (for actual command output)
 */
export function output(message: string): void {
  // biome-ignore lint/suspicious/noConsole: CLI output to stdout
  console.log(message);
}
