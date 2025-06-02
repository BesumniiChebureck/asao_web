"use client";

import { Button, Form, Input, Layout, message, ConfigProvider, Typography, InputNumber, Switch, Card, Divider, Radio, Space, Collapse, Tabs } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

interface Product {
    id: number;
    name: string;
    link: string;
    discount_price: number;
    base_price: number;
    star_count: number;
    review_count: number;
    children?: Product[];
    sellerId?: number;
    currentStrategy?: ApiStrategy;
}

interface ApiStrategy {
    id: number;
    seller_id: number;
    is_default: boolean;
    reprising_method: 'FIXED' | 'COMPETITOR' | 'PERCENT';
    fixed_price: number | null;
    competitor_offset: number | null;
    competitor_source: 'MIN' | 'AVG' | 'MAX' | 'SPECIFIC' | null;
    competitor_article: string | null;
    percent_value: number | null;
    percent_direction: 'ABOVE' | 'BELOW' | null;
    min_price: number | null;
    max_price: number | null;
    notifications: boolean;
    created_date: string;
    updated_date: string | null;
    deleted_date: string | null;
    product_id: number | null;
}

function StrategyPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const [product, setProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [activeMethod, setActiveMethod] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('default');
    const [defaultStrategy, setDefaultStrategy] = useState<ApiStrategy | null>(null);
    const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
    const [sellerId, setSellerId] = useState<number | null>(null);

    const mapApiStrategyToFormValues = (strategy: ApiStrategy) => {
        return {
            id: strategy.id,
            isDefault: strategy.is_default,
            sellerId: strategy.seller_id,
            productId: strategy.product_id,
            reprisingMethod: strategy.reprising_method.toLowerCase() as 'fixed' | 'competitor' | 'percent',
            fixedPrice: strategy.fixed_price,
            competitorOffset: strategy.competitor_offset,
            competitorSource: strategy.competitor_source ? strategy.competitor_source.toLowerCase() as 'min' | 'avg' | 'max' | 'specific' : undefined,
            competitorArticle: strategy.competitor_article,
            percentValue: strategy.percent_value,
            percentDirection: strategy.percent_direction ? strategy.percent_direction.toLowerCase() as 'above' | 'below' : undefined,
            minPrice: strategy.min_price,
            maxPrice: strategy.max_price,
            notifications: strategy.notifications,
            createdAt: strategy.created_date,
            updatedAt: strategy.updated_date || new Date().toISOString(),
            // поля для совместимости со старыми данными
            percentBase: strategy.competitor_source ? strategy.competitor_source.toLowerCase() as 'min' | 'avg' | 'max' | 'specific' : 'avg',
            percentBaseArticle: strategy.competitor_article
        };
    };

    const mapFormValuesToApiStrategy = (values: any, isDefault: boolean, sellerId: number, productId?: number) => {
        const isCompetitorMethod = values.reprisingMethod === 'competitor';
        const isPercentMethod = values.reprisingMethod === 'percent';

        return {
            seller_id: sellerId,
            is_default: isDefault,
            product_id: productId || null,
            reprising_method: values.reprisingMethod.toUpperCase() as 'FIXED' | 'COMPETITOR' | 'PERCENT',
            fixed_price: values.reprisingMethod === 'fixed' ? values.fixedPrice : null,
            competitor_offset: isCompetitorMethod ? values.competitorOffset : null,
            competitor_source: isCompetitorMethod || isPercentMethod
                ? (values.competitorSource || values.percentBase)?.toUpperCase() as 'MIN' | 'AVG' | 'MAX' | 'SPECIFIC'
                : null,
            competitor_article: (isCompetitorMethod && values.competitorSource === 'specific') ||
                (isPercentMethod && values.percentBase === 'specific')
                ? values.competitorArticle || values.percentBaseArticle
                : null,
            percent_value: isPercentMethod ? values.percentValue : null,
            percent_direction: isPercentMethod ? values.percentDirection?.toUpperCase() as 'ABOVE' | 'BELOW' : null,
            min_price: values.minPrice || null,
            max_price: values.maxPrice || null,
            notifications: values.notifications,
            created_date: new Date().toISOString()
        };
    };

    useEffect(() => {
        const storedSellerId = localStorage.getItem('sellerId');
        if (storedSellerId) {
            setSellerId(Number(storedSellerId));
        } else if (globalThis.DEBUG_MODE && globalThis.DEBUG_MODE_WITHOUT_AUTH) {
            setSellerId(1);
        }
    }, []);

    useEffect(() => {
        if (productId && sellerId) {
            loadProductStrategy();
        } else if (sellerId) {
            loadDefaultStrategy();
        }
    }, [productId, sellerId]);

    const loadProductStrategy = async () => {
        if (!IS_DAN_BACKEND_MODE) {
            // Тестовые данные
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

            let mockProduct;

            if (productId == '272261148') {
                mockProduct = {
                    id: 272261148,
                    name: 'FIT Валик велюровый для краски 70 мм диаметр 15/23 мм ворс 4 мм бюгель 6 мм длина ручки 300 мм',
                    link: 'https://example.com/product/1',
                    discount_price: 79,
                    base_price: 89,
                    star_count: 4.5,
                    review_count: 342,
                    children: generateChildren(1, 'Валик велюровый для краски 70 мм'),
                    sellerId: 1,
                    currentStrategy: {
                        id: 1,
                        seller_id: 2,
                        is_default: false,
                        reprising_method: 'FIXED' as const,
                        fixed_price: 1999.99,
                        competitor_offset: null,
                        competitor_source: null,
                        competitor_article: null,
                        percent_value: null,
                        percent_direction: null,
                        min_price: null,
                        max_price: null,
                        notifications: true,
                        created_date: new Date().toISOString(),
                        updated_date: null,
                        deleted_date: null,
                        product_id: 1
                    }
                };
            } else {
                mockProduct = {
                    id: 2,
                    name: 'FIT Молоток 600 гр. кованый DIN 1041, деревянная рукоятка Профи',
                    link: 'https://example.com/product/1',
                    discount_price: 79,
                    base_price: 89,
                    star_count: 4.5,
                    review_count: 342,
                    children: generateChildren(1, 'Молоток 600 гр. кованый'),
                    sellerId: 1,
                    currentStrategy: {
                        id: 3,
                        seller_id: 2,
                        is_default: false,
                        reprising_method: 'FIXED' as const,
                        fixed_price: 1999.99,
                        competitor_offset: null,
                        competitor_source: null,
                        competitor_article: null,
                        percent_value: null,
                        percent_direction: null,
                        min_price: null,
                        max_price: null,
                        notifications: true,
                        created_date: new Date().toISOString(),
                        updated_date: null,
                        deleted_date: null,
                        product_id: 2
                    }
                };
            }

            setProduct(mockProduct);
            setActiveTab('product');
            return;
        }

        setIsLoadingStrategy(true);
        try {
            const response = await fetch(`${ASAO_MAIN_API_HOST}strategies/strategy/?seller_id=${sellerId}&product_id=${productId}`);
            if (!response.ok) throw new Error('Failed to fetch strategy');

            const data: ApiStrategy[] = await response.json();

            // Загружаем информацию о продукте
            const productResponse = await fetch(`${ASAO_MAIN_API_HOST}products/${productId}/`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');

            const productData = await productResponse.json();

            const product: Product = {
                id: productData.id,
                name: productData.name,
                link: productData.link,
                discount_price: productData.discount_price,
                base_price: productData.base_price,
                star_count: productData.star_count,
                review_count: productData.review_count,
                sellerId: productData.seller_id,
                currentStrategy: data.length > 0 ? data[0] : undefined // Устанавливаем стратегию, только если она есть
            };

            setProduct(product);
            setActiveTab('product');

            // Если стратегии нет, показываем сообщение
            if (data.length === 0) {
                message.info('Для этого товара еще нет индивидуальной стратегии. Вы можете создать новую.');
            }
        } catch (error) {
            console.error('Ошибка загрузки стратегии:', error);
            message.error('Не удалось загрузить информацию о товаре');
        } finally {
            setIsLoadingStrategy(false);
        }
    };

    const loadDefaultStrategy = async () => {
        if (!sellerId) return;

        if (!IS_DAN_BACKEND_MODE) {
            // Тестовые данные
            const mockStrategy: ApiStrategy = {
                id: 0,
                seller_id: sellerId,
                is_default: true,
                reprising_method: 'COMPETITOR',
                fixed_price: null,
                competitor_offset: -100,
                competitor_source: 'AVG',
                competitor_article: null,
                percent_value: null,
                percent_direction: null,
                min_price: null,
                max_price: null,
                notifications: true,
                created_date: new Date().toISOString(),
                updated_date: null,
                deleted_date: null,
                product_id: null
            };
            setDefaultStrategy(mockStrategy);
            return;
        }

        setIsLoadingStrategy(true);
        try {
            const response = await fetch(`${ASAO_MAIN_API_HOST}strategies/strategy/?seller_id=${sellerId}`);
            if (!response.ok) throw new Error('Failed to fetch default strategy');

            const data: ApiStrategy[] = await response.json();
            if (data.length === 0) {
                // Если стратегии по умолчанию нет, создаем пустую
                setDefaultStrategy({
                    id: 0,
                    seller_id: sellerId,
                    is_default: true,
                    reprising_method: 'COMPETITOR',
                    fixed_price: null,
                    competitor_offset: null,
                    competitor_source: null,
                    competitor_article: null,
                    percent_value: null,
                    percent_direction: null,
                    min_price: null,
                    max_price: null,
                    notifications: true,
                    created_date: new Date().toISOString(),
                    updated_date: null,
                    deleted_date: null,
                    product_id: null
                });
                return;
            }

            // Находим стратегию по умолчанию (is_default = true)
            const strategy = data.find(s => s.is_default) || data[0];
            setDefaultStrategy(strategy);
        } catch (error) {
            console.error('Ошибка загрузки стратегии:', error);
            message.error('Не удалось загрузить стратегию по умолчанию');
        } finally {
            setIsLoadingStrategy(false);
        }
    };

    useEffect(() => {
        if (product) {
            if (product.currentStrategy) {
                form.setFieldsValue(mapApiStrategyToFormValues(product.currentStrategy));
                setActiveMethod(product.currentStrategy.reprising_method.toLowerCase());
            } else {
                // Устанавливаем значения по умолчанию для новой стратегии
                form.setFieldsValue({
                    reprisingMethod: 'competitor',
                    notifications: true,
                    isDefault: false,
                    productId: product.id,
                    sellerId: product.sellerId
                });
                setActiveMethod('competitor');
            }
        } else if (defaultStrategy) {
            form.setFieldsValue(mapApiStrategyToFormValues(defaultStrategy));
            setActiveMethod(defaultStrategy.reprising_method.toLowerCase());
        }
    }, [product, defaultStrategy, form]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const values = await form.validateFields();
            const isDefault = !product;
            const currentStrategy = product?.currentStrategy || defaultStrategy;

            if (IS_DAN_BACKEND_MODE) {
                const apiData = mapFormValuesToApiStrategy(
                    values,
                    isDefault,
                    sellerId!,
                    product?.id
                );

                // Определяем метод и URL в зависимости от существования стратегии
                const isExistingStrategy = !!currentStrategy?.id;
                const method = isExistingStrategy ? 'PUT' : 'POST';
                const url = isExistingStrategy
                    ? `${ASAO_MAIN_API_HOST}strategies/${currentStrategy?.id}/`
                    : `${ASAO_MAIN_API_HOST}strategies/`;

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(apiData)
                });

                if (!response.ok) throw new Error('Failed to save strategy');

                const savedStrategy = await response.json();
                message.success('Стратегия успешно сохранена');

                if (product) {
                    setProduct({
                        ...product,
                        currentStrategy: savedStrategy
                    });
                } else {
                    setDefaultStrategy(savedStrategy);
                }
            } else {
                // Тестовый режим - просто логируем данные
                console.log('Saving strategy:', values);
                message.success('Стратегия успешно сохранена (тестовый режим)');

                const mockStrategy: ApiStrategy = {
                    id: currentStrategy?.id || Math.floor(Math.random() * 1000),
                    seller_id: sellerId!,
                    is_default: isDefault,
                    reprising_method: values.reprisingMethod.toUpperCase() as any,
                    fixed_price: values.reprisingMethod === 'fixed' ? values.fixedPrice : null,
                    competitor_offset: values.reprisingMethod === 'competitor' ? values.competitorOffset : null,
                    competitor_source: values.reprisingMethod === 'competitor' ? values.competitorSource?.toUpperCase() as any : null,
                    competitor_article: values.reprisingMethod === 'competitor' && values.competitorSource === 'specific' ? values.competitorArticle : null,
                    percent_value: values.reprisingMethod === 'percent' ? values.percentValue : null,
                    percent_direction: values.reprisingMethod === 'percent' ? values.percentDirection?.toUpperCase() as any : null,
                    min_price: values.minPrice || null,
                    max_price: values.maxPrice || null,
                    notifications: values.notifications,
                    created_date: currentStrategy?.created_date || new Date().toISOString(),
                    updated_date: new Date().toISOString(),
                    deleted_date: null,
                    product_id: product?.id || null
                };

                if (product) {
                    setProduct({
                        ...product,
                        currentStrategy: mockStrategy
                    });
                } else {
                    setDefaultStrategy(mockStrategy);
                }
            }
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Пожалуйста, заполните все обязательные поля');
        } finally {
            setIsLoading(false);
        }
    };

    // Остальной код остается без изменений
    const handleMethodChange = (e: any) => {
        const method = e.target.value;
        updateMethodSelection(method);
    };

    const handleCardClick = (method: string) => {
        updateMethodSelection(method);
        form.setFieldsValue({ reprisingMethod: method });
    };

    const updateMethodSelection = (method: string) => {
        setActiveMethod(method);
        if (method !== 'fixed') form.setFieldsValue({ fixedPrice: undefined });
        if (method !== 'competitor') form.setFieldsValue({ competitorOffset: undefined });
        if (method !== 'percent') form.setFieldsValue({ percentValue: undefined, percentDirection: 'above' });
    };

    const handleTabChange = (key: string) => {
        setActiveTab(key);
        form.resetFields();
        setActiveMethod(null);

        if (key === 'default' && sellerId) {
            loadDefaultStrategy();
        } else if (product) {
            if (product.currentStrategy) {
                form.setFieldsValue(mapApiStrategyToFormValues(product.currentStrategy));
                setActiveMethod(product.currentStrategy.reprising_method.toLowerCase());
            } else {
                form.setFieldsValue({
                    reprisingMethod: 'competitor',
                    notifications: true,
                    isDefault: false,
                    productId: product.id,
                    sellerId: product.sellerId
                });
                setActiveMethod('competitor');
            }
        }
    };

    const getCollapseItems = () => {
        const items = [];

        if (activeMethod === 'fixed') {
            items.push({
                key: 'fixed',
                label: <span style={{ color: 'white' }}>Настройки фиксированной цены</span>,
                children: (
                    <Form.Item
                        label={<span style={{ color: 'white' }}>Фиксированная цена</span>}
                        name="fixedPrice"
                        rules={[{ required: activeMethod === 'fixed', message: 'Укажите фиксированную цену' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={0.01}
                            addonAfter="₽"
                            precision={2}
                            placeholder="Например: 1999.99"
                        />
                    </Form.Item>
                ),
            });
        }

        if (activeMethod === 'competitor') {
            items.push({
                key: 'competitor',
                label: <span style={{ color: 'white' }}>Настройки цены под конкурента</span>,
                children: (
                    <>
                        <Form.Item
                            label={<span style={{ color: 'white' }}>Смещение относительно конкурента</span>}
                            name="competitorOffset"
                            rules={[{ required: activeMethod === 'competitor', message: 'Укажите смещение цены' }]}
                            tooltip="Можно установить фиксированное смещение в рублях (например, всегда на 100 руб. дешевле)"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={-10000}
                                max={10000}
                                step={10}
                                addonAfter="₽"
                                placeholder="Например: -100"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: 'white' }}>Выбор конкурента</span>}
                            name="competitorSource"
                            rules={[{ required: activeMethod === 'competitor', message: 'Выберите конкурента' }]}
                        >
                            <Radio.Group>
                                <Space direction="vertical">
                                    <Radio value="min"><span style={{ color: 'white' }}>Самый дешевый конкурент</span></Radio>
                                    <Radio value="avg"><span style={{ color: 'white' }}>Средняя цена по рынку</span></Radio>
                                    <Radio value="max"><span style={{ color: 'white' }}>Самый дорогой конкурент</span></Radio>
                                    <Radio value="specific"><span style={{ color: 'white' }}>Конкретный конкурент (по артикулу)</span></Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) => prevValues.competitorSource !== currentValues.competitorSource}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('competitorSource') === 'specific' ? (
                                    <Form.Item
                                        label={<span style={{ color: 'white' }}>Артикул товара конкурента</span>}
                                        name="competitorArticle"
                                        rules={[{
                                            required: getFieldValue('competitorSource') === 'specific',
                                            message: 'Введите артикул товара конкурента'
                                        }]}
                                    >
                                        <Input placeholder="Например: 1618846446" />
                                    </Form.Item>
                                ) : null
                            }
                        </Form.Item>
                    </>
                ),
            });
        }

        if (activeMethod === 'percent') {
            items.push({
                key: 'percent',
                label: <span style={{ color: 'white' }}>Настройки процентного отклонения</span>,
                children: (
                    <>
                        <Form.Item
                            label={<span style={{ color: 'white' }}>Процентное отклонение</span>}
                            name="percentValue"
                            rules={[{ required: activeMethod === 'percent', message: 'Укажите процент отклонения' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                                step={1}
                                addonAfter="%"
                                placeholder="Например: 5"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: 'white' }}>Направление отклонения</span>}
                            name="percentDirection"
                            rules={[{ required: activeMethod === 'percent', message: 'Выберите направление' }]}
                        >
                            <Radio.Group>
                                <Radio value="above"><span style={{ color: 'white' }}>Выше цены конкурента (+%)</span></Radio>
                                <Radio value="below"><span style={{ color: 'white' }}>Ниже цены конкурента (-%)</span></Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ color: 'white' }}>Базовый конкурент для расчета</span>}
                            name="competitorSource"
                            rules={[{ required: activeMethod === 'percent', message: 'Выберите базового конкурента' }]}
                            initialValue="avg"
                        >
                            <Radio.Group>
                                <Space direction="vertical">
                                    <Radio value="min"><span style={{ color: 'white' }}>Самый дешевый конкурент</span></Radio>
                                    <Radio value="avg"><span style={{ color: 'white' }}>Средняя цена по рынку</span></Radio>
                                    <Radio value="max"><span style={{ color: 'white' }}>Самый дорогой конкурент</span></Radio>
                                    <Radio value="specific"><span style={{ color: 'white' }}>Конкретный конкурент (по артикулу)</span></Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.competitorSource !== currentValues.competitorSource}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('competitorSource') === 'specific' ? (
                                    <Form.Item
                                        label={<span style={{ color: 'white' }}>Артикул товара конкурента</span>}
                                        name="competitorArticle"
                                        rules={[{
                                            required: getFieldValue('competitorSource') === 'specific',
                                            message: 'Введите артикул товара конкурента'
                                        }]}
                                    >
                                        <Input placeholder="Например: 1618846446" />
                                    </Form.Item>
                                ) : null
                            }
                        </Form.Item>
                    </>
                ),
            });
        }

        return items;
    };

    const renderFormContent = () => (
        <>
            {activeTab === 'product' && product && (
                <Form.Item label={<span style={{ color: 'white' }}>Товар</span>}>
                    <Input readOnly value={product.name} />
                </Form.Item>
            )}

            <Divider orientation="left" style={{ color: 'white' }}>Метод регулирования</Divider>

            <Form.Item
                name="reprisingMethod"
                rules={[{ required: true, message: 'Выберите метод регулирования' }]}
            >
                <Radio.Group onChange={handleMethodChange} style={{ width: '100%' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {(activeTab === 'default' && product) || !product
                            ? null
                            : <Card
                                onClick={() => handleCardClick('fixed')}
                                style={{
                                    cursor: 'pointer',
                                    background: activeMethod === 'fixed' ? 'rgba(0,185,107,0.1)' : 'transparent',
                                    borderColor: '#434343'
                                }}
                            >
                                <Radio value="fixed">
                                    <Text strong style={{ color: 'white' }}>Фиксированная цена</Text>
                                    <Text style={{ color: 'white', display: 'block', marginTop: 4 }}>
                                        Цена остается постоянной и не зависит от конкурентов
                                    </Text>
                                </Radio>
                            </Card>}

                        <Card
                            onClick={() => handleCardClick('competitor')}
                            style={{
                                cursor: 'pointer',
                                background: activeMethod === 'competitor' ? 'rgba(0,185,107,0.1)' : 'transparent',
                                borderColor: '#434343'
                            }}
                        >
                            <Radio value="competitor">
                                <Text strong style={{ color: 'white' }}>Цена под конкурента</Text>
                                <Text style={{ color: 'white', display: 'block', marginTop: 4 }}>
                                    Ваша цена будет повторять цену выбранного конкурента
                                </Text>
                            </Radio>
                        </Card>

                        <Card
                            onClick={() => handleCardClick('percent')}
                            style={{
                                cursor: 'pointer',
                                background: activeMethod === 'percent' ? 'rgba(0,185,107,0.1)' : 'transparent',
                                borderColor: '#434343'
                            }}
                        >
                            <Radio value="percent">
                                <Text strong style={{ color: 'white' }}>Цена +/-% от конкурента</Text>
                                <Text style={{ color: 'white', display: 'block', marginTop: 4 }}>
                                    Установите процентное отклонение от цены конкурента
                                </Text>
                            </Radio>
                        </Card>
                    </Space>
                </Radio.Group>
            </Form.Item>

            <Collapse
                items={getCollapseItems()}
                activeKey={activeMethod ? [activeMethod] : []}
                ghost
                expandIconPosition="end"
            />

            <Divider orientation="left" style={{ color: 'white' }}>Дополнительные настройки</Divider>

            <Form.Item
                label={<span style={{ color: 'white' }}>Минимальная цена</span>}
                name="minPrice"
                tooltip="Цена не будет опускаться ниже этого значения"
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={10}
                    addonAfter="₽"
                    placeholder="Не ограничено"
                />
            </Form.Item>

            <Form.Item
                label={<span style={{ color: 'white' }}>Максимальная цена</span>}
                name="maxPrice"
                tooltip="Цена не будет подниматься выше этого значения"
            >
                <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={10}
                    addonAfter="₽"
                    placeholder="Не ограничено"
                />
            </Form.Item>

            <Form.Item
                label={<span style={{ color: 'white' }}>Уведомлять об изменениях на почту</span>}
                name="notifications"
                valuePropName="checked"
            >
                <Switch checkedChildren="Вкл" unCheckedChildren="Выкл" defaultChecked />
            </Form.Item>
        </>
    );

    const renderForm = () => (
        <Form form={form} layout="vertical">
            {renderFormContent()}
            <Form.Item style={{ marginTop: 32 }}>
                <Button
                    type="primary"
                    onClick={handleSave}
                    block
                    size="large"
                    loading={isLoading}
                    style={{ height: 48, fontSize: 16 }}
                >
                    Сохранить стратегию
                </Button>
            </Form.Item>
        </Form>
    );

    const tabItems = useMemo(() => [
        {
            key: 'product',
            label: 'Для этого товара',
            children: renderForm()
        },
        {
            key: 'default',
            label: 'Для всех товаров по умолчанию',
            children: renderForm()
        }
    ], [product, form, activeMethod]);

    const theme = {
        components: {
            Button: {
                //colorPrimary: '#00b96b',
                //colorPrimaryHover: '#00a05d',
                //colorPrimaryActive: '#008751',
            },
            Form: {
                labelColor: 'white',
                labelFontSize: 16,
                labelHeight: 40,
            },
            Radio: {
                buttonSolidCheckedColor: 'white',
                buttonBg: 'transparent',
                //buttonCheckedBg: '#00b96b',
                //colorPrimary: '#00b96b',
                //colorPrimaryHover: '#00a05d',
                //colorPrimaryActive: '#008751',
                //colorBorder: '#434343',
            },
            Collapse: {
                colorTextHeading: 'white',
                colorText: 'white',
                //colorBorder: '#434343',
            },
            Input: {
                //activeBorderColor: '#1890ff',
                //hoverBorderColor: '#1890ff',
                activeShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
                borderRadius: 6,
                //colorBorder: '#434343',
                colorBgContainer: 'white',
                colorText: 'black'
            },
            InputNumber: {
                //activeBorderColor: '#1890ff',
                //hoverBorderColor: '#1890ff',
                activeShadow: '0 0 0 2px rgba(24, 144, 255, 0.2)',
                borderRadius: 6,
                colorBorder: '#434343',
                colorBgContainer: 'white',
                colorText: 'black',
                addonBg: 'rgba(255,255,255,0.8)',
            },
            Card: {
                //colorBorder: '#434343',
                colorBgContainer: 'transparent',
                borderRadius: 8,
            },
            Tabs: {
                colorText: 'white',
                colorTextDisabled: 'rgba(255,255,255,0.3)',
                //colorPrimary: '#00b96b',
                //inkBarColor: '#00b96b',
            }
        },
        token: {
            //colorPrimary: '#00b96b',
            colorText: 'black',
            colorTextSecondary: 'rgba(255,255,255,0.85)',
            //colorBorder: '#434343',
            borderRadius: 6,
        }
    };

    return (
        <ConfigProvider theme={theme}>
            <Layout style={{
                background: "transparent",
                minHeight: '100vh',
                padding: '20px'
            }}>
                <div style={{ maxWidth: 800, width: '100%', margin: '0 auto' }}>
                    <Title level={3} style={{ color: "white", textAlign: "center" }}>
                        <b>{product ? 'Стратегия для товара' : 'Стратегия по умолчанию'}</b>
                    </Title>
                    <Text style={{ color: 'white', display: 'block', textAlign: 'center', marginBottom: 24 }}>
                        {product
                            ? `Настройте правила автоматического изменения цен для "${product.name}"`
                            : 'Настройте правила по умолчанию для всех товаров'}
                    </Text>

                    <Card
                        variant="borderless"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 8,
                            border: '1px solid #434343'
                        }}
                    >
                        {product ? (
                            <Tabs
                                activeKey={activeTab}
                                onChange={handleTabChange}
                                items={tabItems}
                                style={{ color: 'white' }}
                            />
                        ) : renderForm()}
                    </Card>
                </div>
            </Layout>
        </ConfigProvider>
    );
}

export default withAuth(StrategyPage);