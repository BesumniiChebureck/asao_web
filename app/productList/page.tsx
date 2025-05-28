"use client";

import { Layout, message, Spin, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { ProductTable } from "../components/productTable";
import { useEffect, useState } from "react";
import ky from "ky";

const { Title } = Typography;

function ProductListPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (IS_DAN_BACKEND_MODE) {
                    try {
                        const sellerId = localStorage.getItem('sellerId');
                        const response = await ky.get(`${ASAO_MAIN_API_HOST}products/?seller_id=${sellerId}&skip=0&limit=1000`);
                        const data: any = await response.json();

                        if (data.message) {
                            message.error(data.message);
                            setProducts([]);
                        } else {
                            console.log("API data:", data);
                            setProducts(data);
                        }
                    } catch (error) {
                        console.error('API error:', error);
                        message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
                        setProducts([]); // Устанавливаем пустой массив в случае ошибки
                    }
                } else {
                    setProducts(testData);
                }

                // if (process.env.NEXT_PUBLIC_DEBUG_MODE !== 'true') {
                //     // const data = await getProducts();
                //     // setProducts(data);
                //     setProducts(testData);
                // } else {
                //     // Используем тестовые данные в режиме DEBUG
                //     setProducts(testData);
                // }
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const generateChildren = (baseId: number, baseName: string) => {
        return Array.from({ length: 5 }, (_, i) => ({
            id: baseId * 100 + i + 1,
            name: `${baseName} (конкурент ${i + 1})`,
            link: `https://example.com/product/${baseId * 100 + i + 1}`,
            discount_price: Math.round(Math.random() * 1000),
            base_price: Math.round(Math.random() * 1000 + 500),
            star_count: +(Math.random() * 5).toFixed(1),
            review_count: Math.floor(Math.random() * 1000)
        }));
    };

    const testData: Product[] = [
        {
            id: 1,
            name: 'Ручка шариковая Erich Krause, синяя, со сменным стержнем, нажимной механизм',
            link: 'https://example.com/product/1',
            discount_price: 79,
            base_price: 89,
            star_count: 4.5,
            review_count: 342,
            children: generateChildren(1, 'Ручка шариковая Erich Krause, синяя')
        },
        {
            id: 2,
            name: 'Карандаш Koh-i-Noor HB, 12 шт',
            link: 'https://example.com/product/2',
            discount_price: 420,
            base_price: 450,
            star_count: 4.8,
            review_count: 215,
            children: generateChildren(2, 'Карандаш Koh-i-Noor HB, 12 шт')
        },
        {
            id: 3,
            name: 'Блокнот Moleskine A5, клетка',
            link: 'https://example.com/product/3',
            discount_price: 1100,
            base_price: 1200,
            star_count: 4.7,
            review_count: 189,
            children: generateChildren(3, 'Блокнот Moleskine A5, клетка')
        },
        {
            id: 4,
            name: 'Степлер Brauberg Compact №10',
            link: 'https://example.com/product/4',
            discount_price: 290,
            base_price: 320,
            star_count: 4.3,
            review_count: 87,
            children: generateChildren(4, 'Степлер Brauberg Compact №10')
        },
        {
            id: 5,
            name: 'Ластик Koh-i-Noor, белый',
            link: 'https://example.com/product/5',
            discount_price: 50,
            base_price: 65,
            star_count: 4.6,
            review_count: 432,
            children: generateChildren(5, 'Ластик Koh-i-Noor, белый')
        },
        {
            id: 6,
            name: 'Линейка Attache 30см, пластик',
            link: 'https://example.com/product/6',
            discount_price: 70,
            base_price: 85,
            star_count: 4.2,
            review_count: 156,
            children: generateChildren(6, 'Линейка Attache 30см, пластик')
        },
        {
            id: 7,
            name: 'Тонер HP 85A, черный',
            link: 'https://example.com/product/7',
            discount_price: 2900,
            base_price: 3200,
            star_count: 4.9,
            review_count: 321,
            children: generateChildren(7, 'Тонер HP 85A, черный')
        },
        {
            id: 8,
            name: 'Скрепки Brauberg №3, 100шт',
            link: 'https://example.com/product/8',
            discount_price: 30,
            base_price: 45,
            star_count: 4.0,
            review_count: 98,
            children: generateChildren(8, 'Скрепки Brauberg №3, 100шт')
        },
        {
            id: 9,
            name: 'Папка-скоросшиватель Attache А4',
            link: 'https://example.com/product/9',
            discount_price: 90,
            base_price: 120,
            star_count: 4.4,
            review_count: 267,
            children: generateChildren(9, 'Папка-скоросшиватель Attache А4')
        },
        {
            id: 10,
            name: 'Корректор Kores "Лента" 8м',
            link: 'https://example.com/product/10',
            discount_price: 120,
            base_price: 150,
            star_count: 4.1,
            review_count: 143,
            children: generateChildren(10, 'Корректор Kores "Лента" 8м')
        }
    ];

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout style={{ padding: 20, background: "transparent" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Список товаров</b></Title>
            <br />
            {products && <ProductTable products={products} />}
        </Layout>
    );
}

export default withAuth(ProductListPage);