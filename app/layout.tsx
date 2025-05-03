"use client";

import '../CONSTANTS'; // Обеспечивает инициализацию значения констант
import { Button, Layout, Popconfirm, Image, ConfigProvider, Menu, MenuProps, Typography, Space, Spin } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "./globals.css";
import Link from "next/link";
import Paragraph from "antd/es/typography/Paragraph";
import { usePathname, useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";
import { CaretDownOutlined, SettingOutlined, LineChartOutlined, HomeOutlined, InsertRowAboveOutlined, BarChartOutlined, SlidersOutlined } from '@ant-design/icons';
import { hasTokenInCookies, removeTokenFromCookies } from "./services/user-access";
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const { Text } = Typography;

<ConfigProvider
  theme={{
    components: {
      Menu: {
        itemColor: 'white',
        subMenuItemBg: 'white',
        itemSelectedColor: 'white',
      },
    },
  }}
></ConfigProvider>

type MenuItem = Required<MenuProps>['items'][number];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authDate, setAuthDate] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTokenInCookies() && !pathname.startsWith("/registration")) {
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);

      // Получаем время авторизации и имя пользователя из cookies или состояния
      const authDateFromCookies = localStorage.getItem('authDate');
      const userNameFromCookies = localStorage.getItem('userName');

      setAuthDate(authDateFromCookies || '');
      setUserName(userNameFromCookies || '');
    }
  }, []);

  useEffect(() => {
    dayjs.locale('ru');
  }, []);

  const logout = () => {
    removeTokenFromCookies();
    // Очистка данных авторизации при выходе
    localStorage.removeItem('authDate');
    localStorage.removeItem('userName');
    localStorage.removeItem('sellerId');

    router.push("/");
  };

  // Страница авторизации и регистрации обрабатываются отдельно, т.к. им нужно отключить Layout
  if (pathname.startsWith("/auth") || pathname.startsWith("/registration")) {
    return (
      <html lang="en">
        <body>
          <Layout style={{ minHeight: "100vh", background: "transparent" }}>
            <Content style={{ padding: "0 48px", background: "transparent" }}>
              <ConfigProvider locale={ruRU}>
                {children}
              </ConfigProvider>
            </Content>
            <Footer style={{ textAlign: "center", background: "transparent" }}>
              <Paragraph style={{ color: "white" }}>
                © Автоматизированный помощник продавца Ozon {(new Date).getFullYear()} <br />
                <b>AmiSolutions</b>
              </Paragraph>
            </Footer>
          </Layout>
        </body>
      </html>
    );
  }

  // Главная страница нужна для переадресации, поэтому у неё отключен Layout
  if (pathname === "/") {
    return (
      <html lang="en">
        <body style={{ background: "transparent" }}>
          <ConfigProvider locale={ruRU}>
            {children}
          </ConfigProvider>
        </body>
      </html>
    );
  }

  // Если пользователь не авторизован его перенаправит на авторизацию
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body style={{ background: "transparent" }}>
          <ConfigProvider locale={ruRU}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
              <Spin size="large" style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />
            </div>
          </ConfigProvider>
        </body>
      </html>
    );
  }

  const adminItems = globalThis.DEBUG_MODE ? [
    {
      key: 'adminPanel',
      label: <Link href={"/adminPanel"}>Административная панель</Link>,
      icon: <SettingOutlined />
    },
    {
      key: "userList",
      label: <Link href={"/userList"}>Список пользователей</Link>
    },
  ] : [];

  const items: MenuItem[] = [
    {
      key: 'main',
      label: <Link href={"/"}><Image src='/logo.png' width={200} preview={false} alt='Логотип' /></Link>,
    },
    // {
    //   key: "dashboard",
    //   label: <Link href={"/dashboard"}>Рабочее пространство</Link>,
    //   icon: <HomeOutlined />
    // },
    {
      key: "productList",
      label: <Link href={"/productList"}>Список товаров</Link>,
      icon: <InsertRowAboveOutlined />
    },
    {
      key: "statistics",
      label: <Link href={"/statistics"}>Статистика</Link>,
      icon: <BarChartOutlined />
    },
    {
      key: "forecasting",
      label: <Link href={"/forecasting"}>Прогнозирование</Link>,
      icon: <LineChartOutlined />
    },
    {
      key: "strategy",
      label: <Link href={"/strategy"}>Стратегия авторегулирования цен</Link>,
      icon: <SlidersOutlined />
    },
    {
      key: 'subMenu',
      label: 'Дополнительно',
      icon: <CaretDownOutlined />,
      children: [
        ...adminItems,
        {
          key: "logout", label:
            <Popconfirm
              title="Выход из аккаунта"
              description="Вы уверены, что хотите выйти из аккаунта?"
              onConfirm={logout}
              okText="Да"
              cancelText="Нет"
            >
              <Button
                type="primary"
              >
                Выход из аккаунта
              </Button>
            </Popconfirm>
        },
      ],
    },
  ];

  return (
    <html lang="ru">
      <body>
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>
          <Header style={{ background: "transparent" }}>
            <Menu
              theme="dark"
              mode="horizontal"
              items={items}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
              }}
            />
          </Header>
          <Content style={{ padding: "0 48px", background: "transparent" }}>
            <ConfigProvider locale={ruRU}>
              {children}
            </ConfigProvider>
          </Content>
          <Footer style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            background: "transparent",
            minHeight: '64px'
          }}>
            <Paragraph style={{
              color: "white",
              margin: 0,
              textAlign: 'center',
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              © Автоматизированный помощник продавца Ozon {(new Date).getFullYear()} <br />
              <b>AmiSolutions</b>
            </Paragraph>

            <Paragraph style={{
              color: "white",
              margin: 0,
              textAlign: 'right',
              position: 'relative',
              zIndex: 1
            }}>
              <b>{userName}</b> <br />
              {authDate}
            </Paragraph>
          </Footer>
        </Layout>
      </body>
    </html>
  );
}
