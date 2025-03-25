import React, { useState } from 'react';
import { Divider, Flex } from 'antd';
import { Input, Space, Table } from 'antd';

interface Props {
  users: User[];
}

const { Search } = Input;

export const UserTable = ({ users }: Props) => {

  const [searchedInEmailText, setSearchedInEmailText] = useState("");
  const [searchedInNameText, setSearchedInNameText] = useState("");

  const columns = [
    {
      title: 'Идентификатор',
      dataIndex: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
      width: '10%'
    },
    {
      title: 'Электронная почта',
      dataIndex: 'email',
      filteredValue: [searchedInEmailText],
      onFilter: (value: any, record: any) => {
        return String(record.email)
          .toLowerCase()
          .includes(value.toLowerCase());
      },
      sorter: (a: any, b: any) => a.email.localeCompare(b.email), // Сортировка в алфавитном порядке
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      filteredValue: [searchedInNameText],
      onFilter: (value: any, record: any) => {
        return String(record.name)
          .toLowerCase()
          .includes(value.toLowerCase());
      },
      sorter: (a: any, b: any) => a.name.localeCompare(b.name)
    },
  ];

  return (
    <div className="table">
      <Divider />

      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Flex justify="flex-start" align="center" gap="middle">
          <Search
            placeholder="Введите для поиска по email"
            onSearch={(value) => {
              setSearchedInEmailText(value);
            }}
            onChange={(e) => {
              setSearchedInEmailText(e.target.value);
            }}
            enterButton
            style={{ width: 300 }}
          />
          <Search
            placeholder="Введите для поиска по имени"
            onSearch={(value) => {
              setSearchedInNameText(value);
            }}
            onChange={(e) => {
              setSearchedInNameText(e.target.value);
            }}
            enterButton
            style={{ width: 300 }}
          />
        </Flex>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          showSorterTooltip={{ target: 'sorter-icon' }}
        >
        </Table>
      </Space>
    </div>
  );
}