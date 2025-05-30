"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input, Button, message, Flex, Typography, Spin, Layout, Space, Image } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { hasTokenInCookies, login, setTokenInCookies } from '../services/user-access';
import Link from "next/link";
import ky from "ky";

const { Title } = Typography;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (hasTokenInCookies()) {
                router.replace("/productList");
            } else {
                setLoading(false);
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, []);

    if (isCheckingAuth) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
        );
    }

    // const handleLogin = (values: { email: string; password: string }) => {
    //     setTimeout(async () => {
    //         console.log(IS_DAN_BACKEND_MODE);
    //         if (IS_DAN_BACKEND_MODE) {
    //             try {
    //                 const responseBody = await ky.get(`${ASAO_MAIN_API_HOST}sellers/auth/?email=${values.email}&password=${values.password}`);

    //                 const response: any = responseBody.json();

    //                 console.log(response);

    //                 if (response.message) {
    //                     message.error(response.message)
    //                 } else {
    //                     console.log(response.id);
    //                     // Сохраняем идентификатор продавца
    //                     if (response.id) {
    //                         localStorage.setItem('sellerId', response.id);
    //                     }

    //                     // Сохраняем имя пользователя и дату авторизации в localStorage
    //                     if (response.name) {
    //                         localStorage.setItem('userName', response.name);

    //                         const mscDate = new Date();
    //                         mscDate.setHours(mscDate.getHours() + 3);
    //                         localStorage.setItem('authDate', mscDate.toLocaleDateString());
    //                     }

    //                     message.success("Успешный вход!");
    //                     router.replace("/productList");
    //                 }
    //             } catch (error) {
    //                 message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
    //             }
    //             return;
    //         }

    //         if (DEBUG_MODE_WITHOUT_AUTH) {
    //             localStorage.setItem('userName', "Симбат");
    //             localStorage.setItem('authDate', new Date().toLocaleDateString());
    //             localStorage.setItem('sellerId', "1");

    //             message.success("Успешный вход!");
    //             router.replace("/productList");
    //             return;
    //         }

    //         try {
    //             const response = await login(values.email, values.password);

    //             if (response.detail) {
    //                 if (Array.isArray(response.detail))
    //                     response.detail.forEach((err: { msg: string }) => message.error(err.msg));
    //                 else
    //                     message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже. (" + response.detail + ")");
    //             } else {
    //                 if (!hasTokenInCookies())
    //                     setTokenInCookies(response.access_token);

    //                 // Сохраняем идентификатор продавца
    //                 if (response.seller_id) {
    //                     localStorage.setItem('sellerId', response.seller_id);
    //                 }

    //                 // Сохраняем имя пользователя и дату авторизации в localStorage
    //                 if (response.user_name) {
    //                     localStorage.setItem('userName', response.user_name);
    //                     localStorage.setItem('authDate', new Date().toLocaleDateString());
    //                 }

    //                 message.success("Успешный вход!");
    //                 router.replace("/productList");
    //             }
    //         } catch (error) {
    //             message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
    //         }
    //     }, 1000);
    // };

    const handleLogin = (values: { email: string; password: string }) => {
        setTimeout(async () => {
            console.log(IS_DAN_BACKEND_MODE);
            if (IS_DAN_BACKEND_MODE) {
                try {
                    const responseBody = await ky.get(`${ASAO_MAIN_API_HOST}sellers/auth/?email=${values.email}&password=${values.password}`);
                    const responseArray : any = await responseBody.json();
                    const response = responseArray[0]; // Берем первый элемент массива

                    console.log(response);

                    if (response.message) {
                        message.error(response.message)
                    } else {
                        console.log(response.id);
                        // Сохраняем идентификатор продавца
                        if (response.id) {
                            localStorage.setItem('sellerId', response.id);
                        }

                        // Сохраняем имя пользователя и дату авторизации в localStorage
                        if (response.name) {
                            localStorage.setItem('userName', response.name);

                            const mscDate = new Date();
                            mscDate.setHours(mscDate.getHours() + 3);
                            localStorage.setItem('authDate', mscDate.toLocaleDateString());
                        }

                        message.success("Успешный вход!");
                        router.replace("/productList");
                    }
                } catch (error) {
                    message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
                }
                return;
            }

            // Остальной код остается без изменений
            if (DEBUG_MODE_WITHOUT_AUTH) {
                localStorage.setItem('userName', "Симбат");
                localStorage.setItem('authDate', new Date().toLocaleDateString());
                localStorage.setItem('sellerId', "1");

                message.success("Успешный вход!");
                router.replace("/productList");
                return;
            }

            try {
                const response = await login(values.email, values.password);

                if (response.detail) {
                    if (Array.isArray(response.detail))
                        response.detail.forEach((err: { msg: string }) => message.error(err.msg));
                    else
                        message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже. (" + response.detail + ")");
                } else {
                    if (!hasTokenInCookies())
                        setTokenInCookies(response.access_token);

                    // Сохраняем идентификатор продавца
                    if (response.seller_id) {
                        localStorage.setItem('sellerId', response.seller_id);
                    }

                    // Сохраняем имя пользователя и дату авторизации в localStorage
                    if (response.user_name) {
                        localStorage.setItem('userName', response.user_name);
                        localStorage.setItem('authDate', new Date().toLocaleDateString());
                    }

                    message.success("Успешный вход!");
                    router.replace("/productList");
                }
            } catch (error) {
                message.error("Непредвиденная ошибка. Повторите попытку или попробуйте выполнить запрос позже.");
            }
        }, 1000);
    };

    return (
        <Layout style={{ background: "transparent", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <Form
                name="login"
                initialValues={{ remember: true }}
                style={{ minWidth: 260, maxWidth: 360 }}
                onFinish={handleLogin}
            >
                <Form.Item>
                    <Space direction="vertical" align="center" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <Image src='/logo.png' width={200} preview={false} alt='Логотип' />
                        <Title level={2} style={{ margin: '0 auto', width: 'fit-content', color: "white" }}><b>Вход</b></Title>
                    </Space>
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Пожалуйста, введите вашу почту!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Почта" />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Пожалуйста, введите ваш пароль!' }]}
                    style={{ marginTop: 10, marginBottom: 5 }}
                >
                    <Input prefix={<LockOutlined />} type="password" placeholder="Пароль" />
                </Form.Item>
                <Form.Item
                    style={{ marginTop: 5, marginBottom: 15 }}
                >
                    <Flex justify="space-between" align="center">
                        <Link href="">Восстановить пароль</Link>
                    </Flex>
                </Form.Item>
                <Form.Item style={{ marginTop: 10, marginBottom: 10 }}>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Войти
                    </Button>
                </Form.Item>
                <Form.Item
                    style={{ marginTop: 20, marginBottom: 10 }}
                >
                    <Button type="default" href="/registration" block>
                        Зарегистрироваться
                    </Button>
                </Form.Item>
            </Form>
        </Layout>
    );
}
