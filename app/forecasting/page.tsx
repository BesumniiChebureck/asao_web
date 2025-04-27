"use client";

import { Layout, Typography } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";

const { Title } = Typography;

function ForecastingPage() {
    return (
        <Layout style={{ background: "transparent", padding: 20, color: "white" }}>
            <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Прогнозирование</b></Title>
            <br />
        </Layout>
    );
}

export default withAuth(ForecastingPage);