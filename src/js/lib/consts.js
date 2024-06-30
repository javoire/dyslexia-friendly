export const CSS_NAMESPACE = 'dyslexia-friendly';
export const FONT_CLASS_PREFIX = 'dyslexia-friendly-font-';
export const RULER_ID = 'dyslexia-friendly-ruler';
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: process.env.NODE_ENV !== 'production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  logLevel: {
    debug: process.env.LOG_LEVEL === 'debug',
    info: ['info', 'debug'].includes(process.env.LOG_LEVEL),
    warn: ['warn', 'info', 'debug'].includes(process.env.LOG_LEVEL),
    error: ['error', 'warn', 'info', 'debug'].includes(process.env.LOG_LEVEL)
  }
};
