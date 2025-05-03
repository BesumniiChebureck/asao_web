"use client";

import { Layout, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";

const { Title } = Typography;

function DashboardPage() {
    return (
        <Layout style={{ background: "transparent", padding: 20, color: "white" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Рабочее пространство</b></Title>
            <br />
            <br />
            <Title level={2} style={{ color: "white", textAlign: "center" }}><b>Выберите раздел меню</b></Title>
        </Layout>
    );
}

export default withAuth(DashboardPage);