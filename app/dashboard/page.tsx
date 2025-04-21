"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Layout, Spin } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies, removeTokenFromCookies } from '../services/user-access';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    return (
        <Layout style={{ background: "var(--main-gradient)", padding: 20, color: "white" }}>
            <h1>Добро пожаловать в основное рабочее пространство!</h1>
        </Layout>
    );
}
