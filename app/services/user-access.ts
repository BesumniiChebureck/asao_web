import ky from 'ky';
import Cookies from 'js-cookie';

// Вход в систему. Вернет json с ответом
export const login = async (email: string, password: string): Promise<any> => {
  const response = await ky.post(`${globalThis.ASAO_MAIN_API_HOST}api/users/login`, {
    json: { email, password },
    throwHttpErrors: false, // Позволяет получить тело ответа даже при ошибке
  });

  return response.json();
};

// Регистрация
export const registration = async (name: string, email: string): Promise<any> => {
  const response = await ky.post(`${globalThis.ASAO_MAIN_API_HOST}api/users/registration`, {
    json: { name, email },
    throwHttpErrors: false,
  });

  return response.json();
};

// Если токен в куки есть - true, иначе false
export const hasTokenInCookies = () => {
  if (IS_DAN_BACKEND_MODE) {
    const userName = localStorage.getItem('userName');
    return userName !== undefined && userName !== null;
  }

  if (DEBUG_MODE_WITHOUT_AUTH) {
    return true;
  }

  const token = Cookies.get(globalThis.ASAO_ACCESS_TOKEN_NAME);
  return token !== undefined; // Если токен есть, возвращает true
};

// Удалить токен из куки. Если получилось - true, иначе false
export const removeTokenFromCookies = () => {
  try {
    if (IS_DAN_BACKEND_MODE) {
      localStorage.removeItem('userName');
      localStorage.removeItem('sellerId');
      localStorage.removeItem('authDate');
      return true;
    }
    Cookies.remove(globalThis.ASAO_ACCESS_TOKEN_NAME);
    return true;
  } catch (error) {
    return false;
  }
};

// Внести токен в куки.
export const setTokenInCookies = (token: string) => {
  try {
    Cookies.set(globalThis.ASAO_ACCESS_TOKEN_NAME, token);
    return true;
  } catch (error) {
    return false;
  }
};