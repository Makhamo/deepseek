/** Shared Prettier configuration. Extend from a package when it needs overrides. */
import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  semi: true,
  printWidth: 100,
  trailingComma: 'all',
  arrowParens: 'always',
};

export default config;
