"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button, Layout, Spin } from "antd";
import '@ant-design/v5-patch-for-react-19';

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Проверка авторизации
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/auth");
        } else {
            setIsLoading(false);
        }
    }, [router]);

    const logout = () => {
        localStorage.removeItem("token");
        router.push("/");
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    return (
        <Layout style={{ padding: 20 }}>
            <h1>Добро пожаловать в основное рабочее пространство!</h1>
            <Button type="primary" onClick={logout}>Выход из аккаунта</Button>
        </Layout>
    );
}
