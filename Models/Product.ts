interface Product {
    id: string,
    name: string,
    link: string,
    seller?: string,
    sellerId?: number,
    ozon_card_price?: number,
    discount_price: number,
    base_price: number | null,
    star_count: number,
    review_count: number,
    isIncludedInCalculation?: boolean | null,
    children?: Product[] | null,
    currentStrategy?: Strategy, // Индивидуальная стратегия или null (будет браться стратегия из Strategy с isDefault для этого sellerId (но это на бэке при реализации репрайсинга, на фронте это не нужно, просто null))
    correctAmount?: number | null
}

interface Strategy {
    id: number;
    name: string;
    isDefault: boolean; // true - стратегия по умолчанию для товаров продавца
    sellerId?: number;  // Для стратегий по умолчанию (isDefault=true)
    productId?: string; // Для индивидуальных стратегий (isDefault=false)
    reprisingMethod: 'fixed' | 'competitor' | 'percent';
    fixedPrice?: number;
    competitorOffset?: number;
    competitorSource?: 'min' | 'avg' | 'max' | 'specific';
    competitorArticle?: string; // Для конкретного конкурента
    percentValue?: number;
    percentDirection?: 'above' | 'below';
    percentBase?: 'min' | 'avg' | 'max' | 'specific';
    percentBaseArticle?: string; // Для конкретного конкурента
    minPrice?: number;
    maxPrice?: number;
    notifications: boolean;
    createdAt: string;
    updatedAt: string;
}