export const CSS_NAMESPACE = 'dyslexia-friendly';
export const FONT_CLASS_PREFIX = 'dyslexia-friendly-font-';
export const RULER_ID = 'dyslexia-friendly-ruler';
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEV: process.env.NODE_ENV !== 'production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  logLevel: {
    debug: ['debug'].includes(process.env.LOG_LEVEL),
    info: ['debug', 'info'].includes(process.env.LOG_LEVEL),
    warn: ['debug', 'info', 'warn'].includes(process.env.LOG_LEVEL),
    error: ['debug', 'info', 'warn', 'error'].includes(process.env.LOG_LEVEL),
  },
};
