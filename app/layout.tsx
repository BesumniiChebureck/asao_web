"use client";

import { Button, Layout, Popconfirm } from "antd";
import { Menu } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "./globals.css";
import Link from "next/link";
import Paragraph from "antd/es/typography/Paragraph";
import { usePathname, useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";
import '../CONSTANTS';
import { hasTokenInCookies, removeTokenFromCookies } from "./services/user-access";

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
          <Layout style={{ minHeight: "100vh" }}>
            <Content style={{ padding: "0 48px" }}>
              {children}
            </Content>
            <Footer style={{ textAlign: "center" }}>
              <Paragraph>
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
        <body>
          {children}
        </body>
      </html>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = [
    { key: "dashboard", label: <Link href={"/dashboard"}>Рабочее пространство</Link> },
    { key: "productList", label: <Link href={"/productList"}>Список товаров</Link> },
    { key: "statistics", label: <Link href={"/statistics"}>Статистика</Link> },
    { key: "forecasting", label: <Link href={"/forecasting"}>Прогнозирование</Link> },
    { key: "separator", label: <p style={{ marginLeft: '90vh' }}></p> }, //Пропустить пространство TODO: сделать нормально
    { key: "userList", label: <Link href={"/userList"}>Список пользователей</Link> },
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
            style={{ marginTop: 15 }}
            type="primary"
          >
            Выход из аккаунта
          </Button>
        </Popconfirm>
    },
  ];

  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh" }}>
          <Header>
            <Menu
              theme="dark"
              mode="horizontal"
              items={items}
              style={{ flex: 1, minWidth: 0 }}
            />
          </Header>
          <Content style={{ padding: "0 48px" }}>
            {children}
          </Content>
          <Footer style={{ textAlign: "center" }}>
            <Paragraph>
              © Автоматизированный помощник продавца Ozon {(new Date).getFullYear()} <br />
              <b>AmiSolutions</b>
            </Paragraph>
          </Footer>
        </Layout>
      </body>
    </html>
  );
}
