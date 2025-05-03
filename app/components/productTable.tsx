"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Flex, Input, Layout, Space, Table, TableColumnsType, Slider, Dropdown, Typography, Modal, message, Divider, MenuProps } from "antd";
import { DownloadOutlined, DownOutlined, SettingOutlined, LineChartOutlined, BarChartOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import '@ant-design/v5-patch-for-react-19';
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
    products: Product[];
}

const { Search } = Input;
const { Text } = Typography;

export const ProductTable = ({ products = [] }: Props) => {
    const router = useRouter();

    // Вычисляем диапазоны значений из данных
    const calculateRanges = (data: Product[]) => {
        const prices = data.flatMap(item => [item.discount_price, item.base_price]);
        const stars = data.map(item => item.star_count);
        const reviews = data.map(item => item.review_count);

        // Рекурсивно обрабатываем children
        const processChildren = (items: Product[]) => {
            items.forEach(item => {
                if (item.children) {
                    item.children.forEach(child => {
                        prices.push(child.discount_price, child.base_price);
                        stars.push(child.star_count);
                        reviews.push(child.review_count);
                    });
                    processChildren(item.children);
                }
            });
        };

        processChildren(data);

        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            minRating: Math.min(...stars),
            maxRating: Math.max(...stars),
            minReviews: Math.min(...reviews),
            maxReviews: Math.max(...reviews),
        };
    };

    const [baseData] = useState<Product[]>(products);
    const [filteredData, setFilteredData] = useState<Product[]>(products);
    const [ranges, setRanges] = useState(() => calculateRanges(products));
    const [priceRange, setPriceRange] = useState<[number, number]>([ranges.minPrice, ranges.maxPrice]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([ranges.minRating, ranges.maxRating]);
    const [reviewRange, setReviewRange] = useState<[number, number]>([ranges.minReviews, ranges.maxReviews]);
    const tableRef = useRef<HTMLDivElement>(null);

    // Состояния для модального окна добавления товара
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [productLink, setProductLink] = useState('');
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            // Здесь будет API-запрос для добавления товара
            console.log('Добавляем товар по ссылке:', productLink);

            if (true) {
                message.success("Товар успешно добавлен!");
            } else {
                message.error("Ошибка при добавлении товара");
            }

            // После успешного добавления:
            setIsAddModalOpen(false);
            setProductLink('');
            // Можно добавить обновление данных таблицы
            // Например: fetchProducts(); 
        } catch (error) {
            console.error('Ошибка при добавлении товара:', error);
        } finally {
            setLoading(false);
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
            ID: item.id,
            Название: item.name,
            'Базовая цена': item.base_price,
            'Цена со скидкой': item.discount_price,
            'Рейтинг': item.star_count,
            'Отзывы': item.review_count,
            'Ссылка': item.link,
            'Принадлежность': item.children ? 'Собственный' : 'Конкурент'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Товары");

        const fileName = `products_${new Date().toISOString().slice(0, 10)}`;

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
                            Modal.info({
                                title: 'Полное наименование',
                                content: (
                                    <div style={{ marginTop: 16 }}>
                                        <p>{text}</p>
                                        <Button
                                            type="primary"
                                            onClick={() => window.open(link, '_blank')}
                                            style={{ marginTop: 16 }}
                                        >
                                            Перейти к товару
                                        </Button>
                                    </div>
                                ),
                                width: 600,
                            });
                        }}
                    >
                        Подробнее
                    </Button>
                )}
            </div>
        );
    };

    const handleOpenStrategy = (product: Product) => {
        // Открываем страницу стратегии с передачей продукта
        console.log("дошли до роутера");
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

    type MenuItem = Required<MenuProps>['items'][number] & {
        key: string;
        label: React.ReactNode;
        icon?: React.ReactNode;
        onClick?: (e: { domEvent: React.MouseEvent }) => void;
    };

    const baseItems: (MenuItem | { type: 'divider' })[] = [
        {
            key: 'statistics',
            label: 'Статистика',
            icon: <BarChartOutlined />,
        },
        {
            key: 'forecasting',
            label: 'Прогноз',
            icon: <LineChartOutlined />,
        },
        { type: 'divider' },
        {
            key: 'strategy',
            label: 'Стратегия авторегулирования цен',
            icon: <SettingOutlined />,
        },
    ];

    const columns: TableColumnsType<Product> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
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
                    <span style={{ textDecoration: 'line-through' }}>
                        {record.base_price} ₽
                    </span>
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
                <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
                    <Flex align="center" gap="middle" wrap>
                        <Search
                            placeholder="Поиск по ID"
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
                    }}
                    confirmLoading={loading}
                    okText="Добавить"
                    cancelText="Отмена"
                    okButtonProps={{
                        disabled: !productLink.trim() || !isValidUrl(productLink)
                    }}
                >
                    <Input
                        placeholder="Введите ссылку на товар"
                        value={productLink}
                        onChange={(e) => setProductLink(e.target.value)}
                        onPressEnter={handleAddProduct}
                        autoFocus
                    />
                    {productLink && !isValidUrl(productLink) && (
                        <Text type="danger" style={{ marginTop: 8 }}>
                            Пожалуйста, введите корректную ссылку
                        </Text>
                    )}
                </Modal>
            </Space>
        </Layout>
    );
};