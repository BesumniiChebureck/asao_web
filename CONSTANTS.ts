globalThis.IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
globalThis.IS_DAN_BACKEND_MODE = process.env.NEXT_PUBLIC_DAN_BACKEND_MODE === 'true';
globalThis.ASAO_MAIN_API_HOST = 'http://127.0.0.1:8005/';


// Определяем режим
const isDev = true //process.env.NODE_ENV === 'development';
const isProd = !isDev;

// Базовые настройки
globalThis.DEBUG_MODE = isDev;
globalThis.ASAO_ACCESS_TOKEN_NAME = 'ami_access_token';

// Настройки API
// globalThis.ASAO_MAIN_API_HOST = isDev
//   ? process.env.NEXT_PUBLIC_DEV_API_HOST || 'http://localhost:1252/'
//   : process.env.NEXT_PUBLIC_PROD_API_HOST || 'http://localhost:1252/';

// DEBUG-флаги
globalThis.DEBUG_MODE_WITHOUT_AUTH = isDev;
globalThis.DEBUG_MODE_WITHOUT_API = isDev;