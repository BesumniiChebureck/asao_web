"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, message, Typography, Spin, notification, Layout, Space, Image } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies, login, registration, setTokenInCookies } from '../services/user-access';
import Link from "next/link";

const { Title } = Typography;

export default function RegistrationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Проверка авторизации
        if (hasTokenInCookies()) {
            router.replace("/productList");
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

    const handleRegistration = (values: { name: string; email: string; }) => {
        setTimeout(async () => {
            try {
                const response = await registration(values.name, values.email);

                if (response.detail) {
                    if (Array.isArray(response.detail))
                        response.detail.forEach((err: { msg: string }) => message.error(err.msg));
                    else
                        message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже. (" + response.detail + ")");
                } else {
                    message.success("Успешная регистрация!");
                    notification.open({
                        message: 'На почту выслано письмо-подтверждение',
                        description: 'На указанную при регистрации почту выслано подтверждающее письмо с паролем. Используйте его для авторизации.',
                        icon: <SmileOutlined style={{ color: '#108ee9' }} />,
                        duration: 0
                    });
                    router.replace("/auth");
                }
            } catch (error) {
                message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
            }
        }, 1000);
    };

    return (
        <Layout style={{ background: "transparent", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Form
                name="registration"
                initialValues={{ remember: true }}
                style={{ minWidth: 260, maxWidth: 360 }}
                onFinish={handleRegistration}
            >
                <Form.Item>
                    <Space direction="vertical" align="center" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Image src='/logo.png' width={200} preview={false} alt='Логотип' />
                        <Title level={2} style={{ margin: '0 auto', width: 'fit-content', color: "white" }}><b>Регистрация</b></Title>
                    </Space>
                </Form.Item>
                <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Имя" />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Пожалуйста, введите вашу электронную почту!' }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Почта (к которой есть доступ)" />
                </Form.Item>
                <Form.Item style={{ marginTop: 10, marginBottom: 10 }}>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Зарегистрироваться
                    </Button>

                    <p style={{ marginTop: 10, textAlign: 'center' }}><Link href={"/auth"}>Вернуться к авторизации</Link></p>
                </Form.Item>
            </Form>
        </Layout>
    );
}
