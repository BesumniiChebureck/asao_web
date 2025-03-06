"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, message, Flex, Checkbox } from "antd";
import '@ant-design/v5-patch-for-react-19';

const mockUser = {
    username: "admin",
    password: "password123",
};

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (values: { username: string; password: string }) => {
        setLoading(true);

        setTimeout(() => {
            if (values.username !== mockUser.username || values.password !== mockUser.password) {
                message.error("Неверный логин или пароль!");
                setLoading(false);
                return;
            }

            localStorage.setItem("token", "mock-token");
            message.success("Успешный вход!");
            router.push("/dashboard");
        }, 1000);
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Form
                name="login"
                initialValues={{ remember: true }}
                style={{ maxWidth: 360 }}
                onFinish={handleLogin}
            >
                <Form.Item
                    name="username"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваш логин!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Логин" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
                >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item>
                    <Flex justify="space-between" align="center">
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox defaultChecked disabled>Запомнить меня</Checkbox>
                        </Form.Item>
                        <a href="">Забыли пароль?</a>
                    </Flex>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Войти
                    </Button>
                    Нет аккаунта? <a href="">Зарегистрироваться!</a>
                </Form.Item>
            </Form>
        </div>
    );
}
