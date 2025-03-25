import ky from 'ky';

// Получение списка пользователей
export const getAllUsers = async () : Promise<any> => {
    const response = await ky.get(`${globalThis.ASAO_MAIN_API_HOST}api/users`);
    return response.json();
  };