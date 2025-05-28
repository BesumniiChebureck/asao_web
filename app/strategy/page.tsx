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
    currentStrategy?: Strategy;
}

interface Strategy {
    id: number;
    name: string;
    isDefault: boolean;
    sellerId: number;
    reprisingMethod: string;
    notifications: boolean;
    createdAt: string;
    updatedAt: string;
    productId?: number;
    fixedPrice?: number;
    competitorOffset?: number;
    percentValue?: number;
    percentDirection?: string;
    minPrice?: number;
    maxPrice?: number;
}

function StrategyPage() {
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId');
    const [product, setProduct] = useState<Product | null>(null);
    const [form] = Form.useForm();
    const [activeMethod, setActiveMethod] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('default');
    const [defaultStrategy, setDefaultStrategy] = useState<Strategy | null>(null);
    const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
    const [sellerId, setSellerId] = useState<number | null>(null);

    useEffect(() => {
        if (productId) {
            // Загружаем тестовые данные продукта
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
                    id: 1,
                    name: 'FIT Валик велюровый для краски 70 мм диаметр 15/23 мм ворс 4 мм бюгель 6 мм длина ручки 300 мм',
                    link: 'https://example.com/product/1',
                    discount_price: 79,
                    base_price: 89,
                    star_count: 4.5,
                    review_count: 342,
                    children: generateChildren(1, 'Ручка шариковая Erich Krause, синяя'),
                    sellerId: 1,
                    currentStrategy: {
                        id: 1,
                        name: "Текущая стратегия",
                        isDefault: false,
                        sellerId: 2,
                        reprisingMethod: 'fixed',
                        notifications: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        productId: 1
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
                    children: generateChildren(1, 'Ручка шариковая Erich Krause, синяя'),
                    sellerId: 1,
                    currentStrategy: {
                        id: 3,
                        name: "Текущая стратегия",
                        isDefault: false,
                        sellerId: 2,
                        reprisingMethod: 'fixed',
                        notifications: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        productId: 2
                    }
                };
            }

            setProduct(mockProduct);
            setActiveTab('product');
        }
    }, [productId]);

    useEffect(() => {
        const storedSellerId = localStorage.getItem('sellerId');
        if (storedSellerId) {
            setSellerId(Number(storedSellerId));
        } else if (globalThis.DEBUG_MODE && globalThis.DEBUG_MODE_WITHOUT_AUTH) {
            setSellerId(1);
        }
    }, []);

    useEffect(() => {
        if (!product && sellerId) {
            loadDefaultStrategy();
        }
    }, [sellerId]);

    const loadDefaultStrategy = async () => {
        setIsLoadingStrategy(true);
        try {
            const mockStrategy: Strategy = {
                id: 0,
                name: "Стратегия по умолчанию",
                isDefault: true,
                sellerId: sellerId!,
                reprisingMethod: 'competitor',
                notifications: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setDefaultStrategy(mockStrategy);
        } catch (error) {
            console.error('Ошибка загрузки стратегии:', error);
            message.error('Не удалось загрузить стратегию по умолчанию');
        } finally {
            setIsLoadingStrategy(false);
        }
    };

    useEffect(() => {
        if (product) {
            form.setFieldsValue(product.currentStrategy || {
                reprisingMethod: 'competitor',
                notifications: true,
                isDefault: false,
                productId: product.id,
                sellerId: product.sellerId
            });
            setActiveMethod(product.currentStrategy?.reprisingMethod || 'competitor');
        } else if (defaultStrategy) {
            form.setFieldsValue(defaultStrategy);
            setActiveMethod(defaultStrategy.reprisingMethod);
        }
    }, [product, defaultStrategy, form]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const values = await form.validateFields();

            const strategyData: Strategy = {
                ...values,
                id: product?.currentStrategy?.id || defaultStrategy?.id || 0,
                isDefault: !product,
                sellerId: product ? product.sellerId! : sellerId!,
                productId: product?.id,
                createdAt: product?.currentStrategy?.createdAt || defaultStrategy?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Saving strategy:', strategyData);
            message.success('Стратегия успешно сохранена');
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Пожалуйста, заполните все обязательные поля');
        } finally {
            setIsLoading(false);
        }
    };

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
            form.setFieldsValue(product.currentStrategy || {
                reprisingMethod: 'competitor',
                notifications: true,
                isDefault: false,
                productId: product.id,
                sellerId: product.sellerId
            });
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
                            name="percentBase"
                            rules={[{ required: activeMethod === 'percent', message: 'Выберите базового конкурента' }]}
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
                            shouldUpdate={(prevValues, currentValues) => prevValues.percentBase !== currentValues.percentBase}
                        >
                            {({ getFieldValue }) =>
                                getFieldValue('percentBase') === 'specific' ? (
                                    <Form.Item
                                        label={<span style={{ color: 'white' }}>Артикул товара конкурента</span>}
                                        name="percentBaseArticle"
                                        rules={[{
                                            required: getFieldValue('percentBase') === 'specific',
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