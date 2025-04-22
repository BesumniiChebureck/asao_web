"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Space, Spin } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies } from '../services/user-access';
import { PriceChart } from "../components/priceChart";
import '../styles/PriceChart.css';

export default function StatisticsPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Проверка авторизации
        if (!hasTokenInCookies()) {
            router.replace("/auth");
            return;
        }
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    return (
        <div className="app">
            <h1>Анализ цен товаров</h1>
            <PriceChart
                sellerId={1}
                startDate="2025-04-21"
                endDate="2025-04-23"
            />
        </div>
    );
}
