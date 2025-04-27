interface Product {
    id: number,
    name: string,
    link: string,
    seller?: string,
    ozon_card_price?: number,
    discount_price: number,
    base_price: number,
    star_count: number,
    review_count: number
    children?: Product[]
}

interface ProductData {
    id: number,
    product_name: string,
    date_receipt: Date,
    ozon_card_price?: number,
    discount_price: number,
    base_price: number,
    star_count: number,
    review_count: number
}