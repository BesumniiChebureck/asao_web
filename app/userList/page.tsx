"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Space, Spin } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies, removeTokenFromCookies } from '../services/user-access';
import { UserTable } from "../components/userTable";
import { getAllUsers } from "../services/users";

export default function UserListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Проверка авторизации
        if (!hasTokenInCookies()) {
            router.replace("/auth");
            return;
        }

        const getUsers = async () => {
            const users = await getAllUsers();
            setLoading(false);
            setUsers(users);
        };

        getUsers();
    }, [router]);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    return (
        <Layout style={{background: "var(--main-gradient)"}}>
            <br />
            <h2>Список пользователей</h2>

            <UserTable
                    users={users}
                />
        </Layout>
    );
}
