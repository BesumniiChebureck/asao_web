"use client";

import { useEffect, useState } from "react";
import { Button, Flex, Input, Layout, message, Modal, Space, Spin, Table, Tooltip, TableColumnsType, Checkbox } from "antd";
import { useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies, removeTokenFromCookies } from '../services/user-access';

const { Search } = Input;

interface Props {
    products: Product[];
}

export default function ProductListPage({ products }: Props) {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [baseData, setBaseData] = useState<Product[]>([]);
    const [filteredData, setFilteredData] = useState<Product[]>([]);

    useEffect(() => {
        // Проверка авторизации
        if (!hasTokenInCookies()) {
            router.replace("/auth");
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    const columns: TableColumnsType<Product> = [
        {
            title: 'Идентификатор',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            sorter: (a: any, b: any) => a.id - b.id
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        },
        {
            title: 'Продавец',
            dataIndex: 'seller',
            key: 'seller',
            sorter: (a: any, b: any) => a.seller.localeCompare(b.seller),
            render: (seller) => seller ?? "-"
        }
    ];

    const testData: Product[] = [
        {
            id: 1,
            name: 'Молоток 60 см',
            seller: 'AmiМолотки',
        },
        {
            id: 2,
            name: 'Молоток 60 см глянцевый',
            seller: 'MOL от КИ',
        },
        {
            id: 3,
            name: 'Молоток 60 см',
            seller: 'ВсеИнструменты.ру',
        },
    ];

    return (
        <Layout style={{ padding: 20, background: "var(--main-gradient)" }}>
            <Space
                direction="vertical"
                size="middle"
                style={{ display: 'flex', }}
            >
                <Flex justify="space-evenly" vertical={true}>
                    <Flex justify="flex-start" align="center" gap="middle">
                        <Search
                            placeholder="Введите для поиска по идентификатору"
                            onChange={(e) => {
                                //handleSearchName(e);
                            }}
                            allowClear
                            style={{ width: 600 }}
                        />

                        <Search
                            placeholder="Введите для поиска по названию"
                            onChange={(e) => {
                                //handleSearchName(e);
                            }}
                            allowClear
                            style={{ width: 600 }}
                        />

                        <Search
                            placeholder="Введите для поиска по продавцу"
                            onChange={(e) => {
                                //handleSearchFullAddress(e);
                            }}
                            allowClear
                            style={{ width: 600 }}
                        />
                        {/* <Checkbox onChange={(e) => setSearchVk(e.target.checked)} style={{ color: "white" }}>VK</Checkbox>
                        <Checkbox onChange={(e) => setSearchInst(e.target.checked)} style={{ color: "white" }}>Инстаграм</Checkbox>
                        <Checkbox onChange={(e) => setSearchTg(e.target.checked)} style={{ color: "white" }}>Телеграм</Checkbox> */}
                    </Flex>
                </Flex>

                <Table
                    rowKey="id"
                    columns={columns}
                    // dataSource={filteredData}
                    dataSource={testData}
                    showSorterTooltip={{ target: 'sorter-icon' }}
                >
                </Table>
            </Space>
        </Layout>
    );
}
