"use client";

import { Button, Layout } from "antd";
import { Menu } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import "./globals.css";
import Link from "next/link";
import Paragraph from "antd/es/typography/Paragraph";
import { usePathname, useRouter } from "next/navigation";
import '@ant-design/v5-patch-for-react-19';
import { useEffect, useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/auth");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // Обрабатываем страницы авторизации отдельно
  if (pathname.startsWith("/auth")) {
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
    { key: "logout", label: <Button type="primary" onClick={logout}>Выход из аккаунта</Button> },
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
