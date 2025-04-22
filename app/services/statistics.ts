import ky from 'ky';

interface PriceTrendRequest {
    seller_id: string;
    start_date: string;
    end_date: string;
}

// Получить анализ цен
export const getPriceTrend = async (request: PriceTrendRequest): Promise<any> => {
    console.log("Запустил api/statistics/interactive-chart");

    // Создаем URL с query-параметрами
    const url = new URL(`${globalThis.ASAO_MAIN_API_HOST}api/statistics/interactive-chart`);
    url.searchParams.append('seller_id', request.seller_id);
    url.searchParams.append('start_date', request.start_date);
    url.searchParams.append('end_date', request.end_date);

    console.log("Полный URL запроса:", url.toString());

    const response = await ky.post(url.toString(), {
        throwHttpErrors: false,
    });

    console.log("Получил response", response);

    const data : any = await response.json();
    console.log("Полученные данные:", data);

    if (!response.ok || data.status === 'error') {
        throw new Error(data.message ?? 'Не получилось выполнить запрос. Повторите попытку позже.');
    }

    return data;
};