let nodeEnv = process.env.NODE_ENV || 'development';
export default {
  NODE_ENV: nodeEnv,
  IS_DEV: process.env.NODE_ENV !== 'production',
  LOG_LEVEL:
    process.env.LOG_LEVEL || nodeEnv === 'development' ? 'debug' : 'error',
  PORT: process.env.PORT || 3000,
};
