"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Flex, Input, Layout, Space, Table, TableColumnsType, Slider, Dropdown, Typography, Modal, message, Divider, MenuProps, Alert, Tooltip } from "antd";
import { DownloadOutlined, DownOutlined, SettingOutlined, LineChartOutlined, BarChartOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '@ant-design/v5-patch-for-react-19';
import Link from "next/link";
import { useRouter } from "next/navigation";
import ky from "ky";

interface Props {
    products: Product[];
}

const { Search } = Input;
const { Text } = Typography;

export const ProductTable = ({ products = [] }: Props) => {
    const router = useRouter();

    // Вычисляем диапазоны значений из данных
    const calculateRanges = (data: Product[]) => {
        // Функция для безопасного добавления значений, игнорируя null/undefined
        const addValue = (arr: number[], value: number | null | undefined) => {
            if (value != null && !isNaN(value)) {
                arr.push(value);
            }
        };

        const prices: number[] = [];
        const stars: number[] = [];
        const reviews: number[] = [];

        // Обработка основного массива данных
        data.forEach(item => {
            addValue(prices, item.discount_price);
            addValue(prices, item.base_price);
            addValue(stars, item.star_count);
            addValue(reviews, item.review_count);
        });

        // Рекурсивная обработка children
        const processChildren = (items: Product[]) => {
            items.forEach(item => {
                if (item.children) {
                    item.children.forEach(child => {
                        addValue(prices, child.discount_price);
                        addValue(prices, child.base_price);
                        addValue(stars, child.star_count);
                        addValue(reviews, child.review_count);
                    });
                    processChildren(item.children);
                }
            });
        };

        processChildren(data);

        // Проверка на случай, если все значения были null
        const getSafeMin = (arr: number[]) => arr.length > 0 ? Math.min(...arr) : 0;
        const getSafeMax = (arr: number[]) => arr.length > 0 ? Math.max(...arr) : 0;

        return {
            minPrice: getSafeMin(prices),
            maxPrice: getSafeMax(prices),
            minRating: getSafeMin(stars),
            maxRating: getSafeMax(stars),
            minReviews: getSafeMin(reviews),
            maxReviews: getSafeMax(reviews),
        };
    };

    const [baseData] = useState<Product[]>(products);
    const [filteredData, setFilteredData] = useState<Product[]>(products);
    const [ranges, setRanges] = useState(() => calculateRanges(products));
    const [priceRange, setPriceRange] = useState<[number, number]>([ranges.minPrice, ranges.maxPrice]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([ranges.minRating, ranges.maxRating]);
    const [reviewRange, setReviewRange] = useState<[number, number]>([ranges.minReviews, ranges.maxReviews]);
    const tableRef = useRef<HTMLDivElement>(null);

    const [backgroundRequests, setBackgroundRequests] = useState<{
        [key: string]: {
            status: 'pending' | 'success' | 'error';
            message?: string;
        }
    }>({});

    // Состояния для модального окна
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productLink, setProductLink] = useState('');
    const [productSearchName, setProductSearchName] = useState('');
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setRanges(calculateRanges(baseData));
    }, [baseData]);
    // Обработчики действий
    const handleViewStats = (productId: number) => {
        console.log('Просмотр статистики для товара:', productId);
    };

    const handleGetForecast = (productId: number) => {
        console.log('Получение прогноза для товара:', productId);
    };

    // Обработчик добавления товара
    const handleAddProduct = async () => {
        if (!productLink.trim()) return;

        const sellerId = localStorage.getItem('sellerId');
        if (!sellerId) {
            message.error('Не удалось определить идентификатор продавца');
            return;
        }

        // Генерируем уникальный ID для этого запроса
        const requestId = `add-product-${Date.now()}`;

        // Помечаем запрос как выполняющийся
        setBackgroundRequests(prev => ({
            ...prev,
            [requestId]: { status: 'pending' }
        }));

        // Закрываем модальное окно
        setIsAddModalOpen(false);
        setProductLink('');
        setProductSearchName('');

        try {
            const searchName = productSearchName.trim();
            let productUrl = productLink.split('/?')[0];

            // Регулярное выражение для проверки, что строка заканчивается на как минимум 3 цифры
            const regex = /\d{3,}$/;

            if (!regex.test(productUrl)) {
                productUrl = productLink;
            }

            const apiUrl = `${ASAO_MAIN_API_HOST}products/`;

            const response = await ky.post(apiUrl, {
                searchParams: {
                    search_name: searchName,
                    own_product_url: productUrl,
                    seller_id: sellerId
                },
                headers: {
                    'accept': 'application/json'
                },
                timeout: 600000, //10 минут
                body: null
            });

            const data: any = await response.json();

            if (data.products) {
                // Обновляем статус запроса
                setBackgroundRequests(prev => ({
                    ...prev,
                    [requestId]: {
                        status: 'success',
                        message: 'Товар успешно добавлен в систему!'
                    }
                }));

                // Показываем уведомление
                message.success({
                    content: (
                        <span>
                            Товар успешно добавлен в систему! <br />
                            <Button
                                type="link"
                                size="small"
                                onClick={() => message.destroy()}
                                style={{ padding: 0, height: 'auto' }}
                            >
                                Закрыть
                            </Button>
                        </span>
                    ),
                    duration: 0,
                    key: requestId
                });

                // Обновляем данные после удаления
                try {
                    const response = await ky.get(`${ASAO_MAIN_API_HOST}products/?seller_id=${sellerId}&skip=0&limit=1000`);
                    const data: any = await response.json();

                    if (data.message) {
                        message.error(data.message);
                    } else {
                        console.log("API data:", data);
                        products = data;
                    }
                } catch (error) {
                    console.error('API error:', error);
                    message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
                }
            } else {
                throw new Error('Не удалось добавить товар');
            }
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);

            setBackgroundRequests(prev => ({
                ...prev,
                [requestId]: {
                    status: 'error',
                    message: 'Произошла ошибка при добавлении товара. Пожалуйста, попробуйте позже.'
                }
            }));

            message.error({
                content: 'Произошла ошибка при добавлении товара. Пожалуйста, попробуйте позже.',
                duration: 0,
                key: requestId
            });
        }
    };


    // Экспорт в Excel/CSV
    const exportToExcel = (type: 'xlsx' | 'csv') => {
        // Собираем все товары (и родительские и дочерние) в плоский список
        const flattenProducts = (items: Product[]): Product[] => {
            return items.reduce((acc: Product[], item) => {
                acc.push(item);
                if (item.children) {
                    acc.push(...flattenProducts(item.children));
                }
                return acc;
            }, []);
        };

        const allProducts = flattenProducts(filteredData);

        const dataToExport = allProducts.map(item => ({
            'Артикул': item.id,
            'Название': item.name || '-',
            'Базовая цена': item.base_price || '-',
            'Цена со скидкой': item.discount_price || '-',
            'Рейтинг': item.star_count || '-',
            'Отзывы': item.review_count || '-',
            'Ссылка': item.link,
            'Принадлежность': item.children ? 'Собственный' : 'Конкурент'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Товары");

        // Московское время для формирование отчёта
        const mscDate = new Date();
        mscDate.setHours(mscDate.getHours() + 3);
        const fileName = `Список_товаров_${mscDate.toISOString().slice(0, 10)}`;

        if (type === 'xlsx') {
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } else {
            XLSX.writeFile(workbook, `${fileName}.csv`, { bookType: 'csv' });
        }
    };

    const exportItems = [
        { key: 'xlsx', label: 'Экспорт в Excel (.xlsx)' },
        { key: 'csv', label: 'Экспорт в CSV (.csv)' }
    ];

    const handleExportClick = ({ key }: { key: string }) => {
        exportToExcel(key as 'xlsx' | 'csv');
    };

    // Рекурсивная фильтрация данных
    const applyFilters = () => {
        const filterItems = (items: Product[]): Product[] => {
            return items
                .filter(item =>
                    item.discount_price >= priceRange[0] &&
                    item.discount_price <= priceRange[1] &&
                    item.star_count >= ratingRange[0] &&
                    item.star_count <= ratingRange[1] &&
                    item.review_count >= reviewRange[0] &&
                    item.review_count <= reviewRange[1]
                )
                .map(item => ({
                    ...item,
                    children: item.children ? filterItems(item.children) : undefined
                }));
        };

        const filtered = filterItems(baseData);
        setFilteredData(filtered);
    };

    // Сброс фильтров
    const resetFilters = () => {
        setPriceRange([ranges.minPrice, ranges.maxPrice]);
        setRatingRange([ranges.minRating, ranges.maxRating]);
        setReviewRange([ranges.minReviews, ranges.maxReviews]);
        setFilteredData(baseData);
    };

    const ExpandableTextLink = ({ text, link }: { text: string; link: string }) => {
        const MAX_LENGTH = 70;
        const isLongText = text?.length > MAX_LENGTH;
        const displayedText = isLongText ? `${text.substring(0, MAX_LENGTH)}...` : text;
        const [modalOpen, setModalOpen] = useState(false);

        return (
            <div style={{ position: 'relative', paddingRight: isLongText ? 70 : 0 }}>
                <Link
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tableLink"
                    style={{
                        display: 'inline-block',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        verticalAlign: 'middle'
                    }}
                    title={text}
                >
                    {displayedText}
                </Link>

                {isLongText && (
                    <>
                        <Button
                            type="link"
                            size="small"
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '0 4px',
                                height: 'auto'
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setModalOpen(true);
                            }}
                        >
                            Подробнее
                        </Button>

                        <Modal
                            title="Полное наименование"
                            open={modalOpen}
                            onCancel={() => setModalOpen(false)}
                            footer={[
                                <Button
                                    key="link"
                                    type="primary"
                                    onClick={() => window.open(link, '_blank')}
                                >
                                    Перейти к товару
                                </Button>,
                                <Button key="back" onClick={() => setModalOpen(false)}>
                                    Закрыть
                                </Button>
                            ]}
                            width={600}
                        >
                            <p>{text}</p>
                        </Modal>
                    </>
                )}
            </div>
        );
    };

    const handleOpenDelMsg = async (product: Product) => {
        const sellerId = localStorage.getItem('sellerId');
        if (!sellerId) {
            message.error('Не удалось определить идентификатор продавца');
            return;
        }

        try {
            // Показываем подтверждающий диалог перед удалением
            Modal.confirm({
                title: 'Удаление товара',
                content: `Вы уверены, что хотите удалить товар "${product.name}" (артикул: ${product.id})?`,
                okText: 'Удалить',
                cancelText: 'Отмена',
                okButtonProps: { danger: true },
                async onOk() {
                    try {
                        const response = await ky.delete(`${ASAO_MAIN_API_HOST}products/${product.id}`, {
                            searchParams: { seller_id: sellerId },
                            headers: {
                                'accept': 'application/json'
                            }
                        });

                        if (response.ok) {
                            message.success('Товар успешно удален');

                            // Обновляем данные после удаления
                            try {
                                const response = await ky.get(`${ASAO_MAIN_API_HOST}products/?seller_id=${sellerId}&skip=0&limit=1000`);
                                const data: any = await response.json();

                                if (data.message) {
                                    message.error(data.message);
                                } else {
                                    console.log("API data:", data);
                                    products = data;
                                }
                            } catch (error) {
                                console.error('API error:', error);
                                message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
                            }
                        } else {
                            throw new Error('Не удалось удалить товар');
                        }
                    } catch (error) {
                        console.error('Ошибка при удалении товара:', error);
                        message.error('Произошла ошибка при удалении товара. Пожалуйста, попробуйте позже.');
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
            message.error('Произошла ошибка при удалении товара. Пожалуйста, попробуйте позже.');
        }
    };

    const handleOpenStrategy = (product: Product) => {
        // Открываем страницу стратегии с передачей продукта
        router.push(`/strategy?productId=${product.id}`);
    };

    const handleOpenStatistics = (product: Product) => {
        // Открываем страницу статистики с передачей продукта
        router.push(`/statistics?productId=${product.id}`);
    };

    const handleOpenForecast = (product: Product) => {
        // Открываем страницу прогноза с передачей продукта
        router.push(`/forecast?productId=${product.id}`);
    };

    const columns: TableColumnsType<Product> = [
        {
            title: 'Артикул',
            dataIndex: 'id',
            key: 'id',
            width: '12%',
            sorter: (a, b) => a.id - b.id
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => <ExpandableTextLink text={text} link={record.link} />
        },
        {
            title: 'Цена',
            key: 'price',
            width: 150,
            sorter: (a, b) => a.discount_price - b.discount_price,
            render: (_, record) => (
                <Space>
                    {record.base_price ?
                        (
                            <span style={{ textDecoration: 'line-through' }}>
                                {record.base_price} ₽
                            </span>
                        )
                        : null
                    }
                    <span style={{ fontWeight: 'bold' }}>
                        {record.discount_price} ₽
                    </span>
                </Space>
            ),
            filters: [
                { text: 'До 100 ₽', value: 100 },
                { text: '100-500 ₽', value: 500 },
                { text: '500-1000 ₽', value: 1000 },
                { text: 'Свыше 1000 ₽', value: 1001 },
            ],
            onFilter: (value, record) => {
                const numValue = Number(value);
                if (numValue === 100) return record.discount_price <= 100;
                if (numValue === 500) return record.discount_price > 100 && record.discount_price <= 500;
                if (numValue === 1000) return record.discount_price > 500 && record.discount_price <= 1000;
                return record.discount_price > 1000;
            }
        },
        {
            title: 'Рейтинг',
            dataIndex: 'star_count',
            key: 'star_count',
            width: 120,
            sorter: (a, b) => a.star_count - b.star_count,
            render: (rating) => `${rating} ★`,
            filters: [
                { text: '1 звезда', value: 1 },
                { text: '2 звезды', value: 2 },
                { text: '3 звезды', value: 3 },
                { text: '4 звезды', value: 4 },
                { text: '5 звезд', value: 5 },
            ],
            onFilter: (value, record) => Math.floor(record.star_count) === value,
        },
        {
            title: 'Отзывы',
            dataIndex: 'review_count',
            key: 'review_count',
            width: 120,
            sorter: (a, b) => a.review_count - b.review_count,
            render: (reviews) => `${reviews} отз.`,
        },
        {
            title: 'Действия',
            key: 'actions',
            width: '10%',
            render: (_, record: Product) => {
                const menuItems: MenuProps['items'] = [
                    {
                        key: 'statistics',
                        label: 'Статистика',
                        icon: <BarChartOutlined />,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleOpenStatistics(record);
                        }
                    },
                    {
                        key: 'forecasting',
                        label: 'Прогноз',
                        icon: <LineChartOutlined />,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleOpenForecast(record);
                        }
                    },
                    { type: 'divider' },
                    {
                        key: 'strategy',
                        label: 'Стратегия авторегулирования цен',
                        icon: <SettingOutlined />,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleOpenStrategy(record);
                        }
                    },
                    { type: 'divider' },
                    {
                        key: 'delete',
                        label: 'Удалить товар',
                        icon: <DeleteOutlined />,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleOpenDelMsg(record);
                        }
                    }
                ];

                return (
                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                    >
                        <Button>
                            Действия <DownOutlined />
                        </Button>
                    </Dropdown>
                );
            }
        }
    ];

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <Layout style={{ background: "transparent" }}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                {/* Панель уведомлений о фоновых операциях */}
                <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
                    {Object.entries(backgroundRequests).map(([id, request]) => (
                        request.status === 'pending' && (
                            <Alert
                                key={id}
                                message="Добавление товара"
                                description="Запрос выполняется в фоновом режиме. Вы получите уведомление по завершении."
                                type="info"
                                showIcon
                                closable
                                onClose={() => {
                                    setBackgroundRequests(prev => {
                                        const newState = { ...prev };
                                        delete newState[id];
                                        return newState;
                                    });
                                }}
                                style={{ marginBottom: 10, width: 300 }}
                            />
                        )
                    ))}
                </div>
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap="middle" wrap>
                        <Search
                            placeholder="Поиск по артикулу"
                            allowClear
                            onChange={(e) => {
                                const value = e.target.value.toLowerCase();
                                const filtered = baseData.filter(item =>
                                    item.id.toString().includes(value)
                                );
                                setFilteredData(filtered);
                            }}
                            style={{ width: 200 }}
                        />
                        <Search
                            placeholder="Поиск по названию"
                            allowClear
                            onChange={(e) => {
                                const value = e.target.value.toLowerCase();
                                const filtered = baseData.filter(item =>
                                    item.name.toLowerCase().includes(value)
                                );
                                setFilteredData(filtered);
                            }}
                            style={{ width: 250 }}
                        />
                    </Flex>

                    <Flex align="center" gap="middle" wrap>
                        <Dropdown.Button
                            icon={<DownloadOutlined />}
                            menu={{ items: exportItems, onClick: handleExportClick }}
                            onClick={() => exportToExcel('xlsx')}
                        >
                            Экспорт
                        </Dropdown.Button>
                    </Flex>
                </Flex>

                <Flex justify="space-between" align="center" wrap gap="middle">
                    <Space direction="vertical" style={{ width: 300 }}>
                        <Text style={{ color: 'white' }}>Диапазон цен: {priceRange[0]} - {priceRange[1]} ₽</Text>
                        <Slider
                            range
                            min={ranges.minPrice}
                            max={ranges.maxPrice}
                            step={Math.max(1, Math.floor((ranges.maxPrice - ranges.minPrice) / 100))}
                            value={priceRange}
                            onChange={(value) => setPriceRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Space direction="vertical" style={{ width: 250 }}>
                        <Text style={{ color: 'white' }}>Рейтинг: {ratingRange[0]} - {ratingRange[1]} ★</Text>
                        <Slider
                            range
                            min={ranges.minRating}
                            max={ranges.maxRating}
                            step={0.1}
                            value={ratingRange}
                            onChange={(value) => setRatingRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Space direction="vertical" style={{ width: 250 }}>
                        <Text style={{ color: 'white' }}>Отзывы: {reviewRange[0]} - {reviewRange[1]}</Text>
                        <Slider
                            range
                            min={ranges.minReviews}
                            max={ranges.maxReviews}
                            step={Math.max(1, Math.floor((ranges.maxReviews - ranges.minReviews) / 100))}
                            value={reviewRange}
                            onChange={(value) => setReviewRange(value as [number, number])}
                            onChangeComplete={applyFilters}
                        />
                    </Space>

                    <Button onClick={resetFilters}>Сбросить фильтры</Button>
                </Flex>

                <div ref={tableRef}>
                    <Table
                        rowKey="id"
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['10', '25', '50', '100']
                        }}
                        scroll={{ x: 'max-content' }}
                        bordered
                    />
                </div>

                <Flex justify="center" style={{ marginTop: 16 }}>
                    <Button
                        type="default"
                        onClick={() => setIsAddModalOpen(true)}
                        style={{ width: 200 }}
                    >
                        Добавить товар
                    </Button>
                </Flex>

                {/* Модальное окно добавления товара */}
                <Modal
                    title="Добавить новый товар"
                    open={isAddModalOpen}
                    onOk={handleAddProduct}
                    onCancel={() => {
                        setIsAddModalOpen(false);
                        setProductLink('');
                        setProductSearchName('');
                    }}
                    confirmLoading={loading}
                    okText="Добавить"
                    cancelText="Отмена"
                    okButtonProps={{
                        disabled: !productLink.trim() || !isValidUrl(productLink)
                    }}
                    width={600}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                            <Text strong>Ссылка на товар</Text>
                            <Input
                                placeholder="Введите ссылку на товар"
                                value={productLink}
                                onChange={(e) => setProductLink(e.target.value)}
                                onPressEnter={handleAddProduct}
                                autoFocus
                            />
                            {productLink && !isValidUrl(productLink) && (
                                <Text type="danger" style={{ marginTop: 8, display: 'block' }}>
                                    Пожалуйста, введите корректную ссылку
                                </Text>
                            )}
                        </div>

                        <div>
                            <Flex align="center" gap={4}>
                                <Text strong>Наименование для поиска конкурентов</Text>
                                <Tooltip
                                    title="Если ничего не указать, поиск будет осуществляться по наименованию товара из карточки товара"
                                    placement="right"
                                >
                                    <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
                                </Tooltip>
                            </Flex>
                            <Input
                                placeholder="Введите наименование по которому будет осуществляться поиск"
                                value={productSearchName}
                                onChange={(e) => setProductSearchName(e.target.value)}
                                onPressEnter={handleAddProduct}
                                style={{ marginTop: 4 }}
                            />
                        </div>

                        {isProcessing && (
                            <Alert
                                message="Обработка запроса"
                                description="Добавление товара может занять до 5 минут.."
                                type="info"
                                showIcon
                            />
                        )}
                    </Space>
                </Modal>
            </Space>
        </Layout>
    );
};