"use client";

import { useEffect, useState } from "react";
import { Layout, message, Spin, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { UserTable } from "../components/userTable";
import { getAllUsers } from "../services/users";
import { withAuth } from "../hocs/withAuth";

const { Title } = Typography;

function UserListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const users = await getAllUsers();
                setUsers(users);
            } catch (error) {
                message.error(
                    error instanceof Error 
                      ? error.message 
                      : 'Ошибка при загрузке пользователей'
                  );
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <Layout style={{ background: "transparent" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Список пользователей</b></Title>
            <br />

            <UserTable
                users={users}
            />
        </Layout>
    );
}

export default withAuth(UserListPage);