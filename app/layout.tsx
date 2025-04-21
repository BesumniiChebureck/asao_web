"use client";

import { Button, Layout, Popconfirm, Image, ConfigProvider } from "antd";
import { Menu, MenuProps } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "./globals.css";
import Link from "next/link";
import Paragraph from "antd/es/typography/Paragraph";
import { usePathname, useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";
import { CaretDownOutlined, SettingOutlined, LineChartOutlined, HomeOutlined, InsertRowAboveOutlined, BarChartOutlined } from '@ant-design/icons';
import '../CONSTANTS';
import { hasTokenInCookies, removeTokenFromCookies } from "./services/user-access";


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

  useEffect(() => {
    if (!hasTokenInCookies() && !pathname.startsWith("/registration")) {
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    removeTokenFromCookies();
    router.push("/");
  };

  // Страница авторизации и регистрации обрабатываются отдельно, т.к. им нужно отключить Layout
  if (pathname.startsWith("/auth") || pathname.startsWith("/registration")) {
    return (
      <html lang="en">
        <body>
          <Layout style={{ minHeight: "100vh", background: "var(--main-gradient)" }}>
            <Content style={{ padding: "0 48px", background: "var(--main-gradient)" }}>
              {children}
            </Content>
            <Footer style={{ textAlign: "center", background: "var(--main-gradient)" }}>
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
        <body style={{ background: "var(--main-gradient)" }}>
          {children}
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items: MenuItem[] = [
    {
      key: 'main',
      label: <Link href={"/"}><Image src='/logo.png' width={200} preview={false} alt='Логотип' /></Link>,
    },
    {
      key: "dashboard",
      label: <Link href={"/dashboard"}>Рабочее пространство</Link>,
      icon: <HomeOutlined />
    },
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
      key: 'subMenu',
      label: 'Дополнительно',
      icon: <CaretDownOutlined />,
      children: [
        {
          key: 'adminPanel',
          label: <Link href={"/adminPanel"}>Административная панель</Link>,
          icon: <SettingOutlined />
        },
        {
          key: "userList",
          label: <Link href={"/userList"}>Список пользователей</Link>
        },
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
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh", background: "var(--main-gradient)" }}>
          <Header style={{ background: "var(--main-gradient)" }}>
            <Menu
              theme="dark"
              mode="horizontal"
              items={items}
              style={{
                flex: 1,
                minWidth: 0,
                background: "var(--main-gradient)",
              }}
            />
          </Header>
          <Content style={{ padding: "0 48px", background: "var(--main-gradient)" }}>
            {children}
          </Content>
          <Footer style={{ textAlign: "center", background: "var(--main-gradient)" }}>
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
