"use client";

import { Button, Checkbox, Form, Input, Layout, message, ConfigProvider, Typography, InputNumber, Switch } from "antd";
import '@ant-design/v5-patch-for-react-19';
import { withAuth } from "../hocs/withAuth";
import { useState, useEffect } from 'react';

const { Title } = Typography;

type ConfigVariable = {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean';
};

function AdminPanelPage() {
  const [form] = Form.useForm();
  const [configVariables, setConfigVariables] = useState<ConfigVariable[]>([]);

  const getGlobalConfigVariables = (): ConfigVariable[] => {
    return Object.keys(window)
        .filter(key => (key.startsWith('ASAO_') || key.startsWith('DEBUG_'))) // && key !== 'ASAO_ACCESS_TOKEN_NAME' если надо что-то исключить
        .map(key => {
            const value = (window as any)[key];
            return {
                name: key,
                value,
                type: typeof value === 'boolean' ? 'boolean' : 
                     typeof value === 'number' ? 'number' : 'string'
            };
        });
};

  useEffect(() => {
    const vars = getGlobalConfigVariables();
    setConfigVariables(vars);
    
    const initialValues = {
      sellerId: localStorage.getItem('sellerId') || '',
      userName: localStorage.getItem('userName') || '',
      ...vars.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {} as Record<string, any>)
    };
    
    form.setFieldsValue(initialValues);
  }, [form]);

  const handleSave = () => {
    const values = form.getFieldsValue();
    
    // Сохраняем специальные поля
    localStorage.setItem('sellerId', values.sellerId);
    localStorage.setItem('userName', values.userName);
    
    // Сохраняем глобальные переменные
    configVariables.forEach(variable => {
        if (variable.name in globalThis) {
            (globalThis as any)[variable.name] = values[variable.name];
        }
    });
    
    message.success('Настройки сохранены!');
  };

  const renderFormItem = (variable: ConfigVariable) => {
    switch (variable.type) {
      case 'boolean':
        return <Switch />;
      case 'number':
        return <InputNumber style={{ width: '100%' }} />;
      default:
        return <Input />;
    }
  };

  const theme = {
    components: {
      Form: {
        labelColor: 'white',
        labelFontSize: 16,
        labelHeight: 40,
      },
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{
        background: "transparent",
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Title level={3} style={{ color: "white", textAlign: "center" }}><b>Административная панель</b></Title>
        <br />
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 500, width: '100%' }}
        >
          {/* Специальные поля */}
          <Form.Item label="Идентификатор продавца" name="sellerId">
            <Input placeholder="Введите sellerId" />
          </Form.Item>

          <Form.Item label="Имя пользователя" name="userName">
            <Input placeholder="Введите имя пользователя" />
          </Form.Item>

          {/* Автоматические поля из globalThis */}
          {configVariables.map(variable => (
            <Form.Item 
              key={variable.name} 
              label={variable.name}
              name={variable.name}
              valuePropName={variable.type === 'boolean' ? 'checked' : 'value'}
            >
              {renderFormItem(variable)}
            </Form.Item>
          ))}
          
          <Form.Item>
            <Button type="primary" onClick={handleSave} block>
              Сохранить все настройки
            </Button>
          </Form.Item>
        </Form>
      </Layout>
    </ConfigProvider>
  );
}

export default withAuth(AdminPanelPage);