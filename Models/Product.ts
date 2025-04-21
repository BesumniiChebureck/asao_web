interface Product {
    id: number,
    name: string,
    seller?: string
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