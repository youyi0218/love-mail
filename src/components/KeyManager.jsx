import React, { useState, useEffect } from 'react';
import { List, Button, Modal, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const KeyManager = ({ password, onSelectKey, selectedKey }) => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [newKey, setNewKey] = useState('');

  // 加载密钥列表
  const loadKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      if (result.success) {
        setKeys(result.keys);
        // 如果没有选中的密钥，自动选择第一个
        if (!selectedKey && result.keys.length > 0) {
          onSelectKey(result.keys[0].key);
        }
      } else {
        message.error(result.message || '加载失败');
      }
    } catch (error) {
      console.error('加载密钥失败:', error);
      message.error('加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 首次加载
  useEffect(() => {
    loadKeys();
  }, [password]);

  // 修改密钥
  const handleUpdateKey = async () => {
    try {
      if (!newKey.trim()) {
        message.error('请输入新密钥');
        return;
      }

      const response = await fetch('/api/updateKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldKey: currentKey,
          newKey: newKey.trim(),
          password
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('修改成功');
        setEditModalVisible(false);
        setNewKey('');
        loadKeys();
      } else {
        message.error(result.message || '修改失败');
      }
    } catch (error) {
      console.error('修改密钥失败:', error);
      message.error('修改失败，请重试');
    }
  };

  // 删除密钥
  const handleDeleteKey = async (key) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个密钥吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('/api/deleteKey', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key,
              password
            })
          });

          const result = await response.json();
          if (result.success) {
            message.success('删除成功');
            if (selectedKey === key) {
              onSelectKey(null);
            }
            loadKeys();
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除密钥失败:', error);
          message.error('删除失败，请重试');
        }
      }
    });
  };

  // 添加新密钥
  const handleAddKey = async () => {
    try {
      if (!newKey.trim()) {
        message.error('请输入密钥');
        return;
      }

      const response = await fetch('/api/createKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newKey.trim(),
          password
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success('添加成功');
        setAddModalVisible(false);
        setNewKey('');
        // 使用返回的密钥列表直接更新
        if (result.keys) {
          setKeys(result.keys);
        } else {
          // 如果没有返回密钥列表，则重新加载
          loadKeys();
        }
      } else {
        message.error(result.message || '添加失败');
      }
    } catch (error) {
      console.error('添加密钥失败:', error);
      message.error('添加失败，请重试');
    }
  };

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg p-4 h-full flex flex-col">
      <div className="h-20 flex items-center justify-between">
        <h2 className="text-2xl font-romantic text-pink-600">密钥管理</h2>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={() => {
            setAddModalVisible(true);
            setNewKey('');
          }}
          className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 flex items-center justify-center h-10 w-10 text-lg"
        />
      </div>

      <List
        loading={loading}
        dataSource={keys}
        className="flex-1"
        locale={{
          emptyText: (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-500">暂无密钥</span>
            </div>
          )
        }}
        renderItem={(item) => (
          <List.Item
            className={`flex items-center justify-between cursor-pointer transition-colors hover:bg-pink-50 rounded-lg p-2 ${
              selectedKey === item.key ? 'bg-pink-100' : ''
            }`}
            onClick={() => onSelectKey(item.key)}
            actions={[
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentKey(item.key);
                  setNewKey(item.key);
                  setEditModalVisible(true);
                }}
              />,
              <Button
                key="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteKey(item.key);
                }}
              />
            ]}
          >
            <div className="flex-1 truncate mr-2">
              <div className="font-mono text-sm">{item.key}</div>
              <div className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          </List.Item>
        )}
      />

      <Modal
        title="修改密钥"
        open={editModalVisible}
        onOk={handleUpdateKey}
        onCancel={() => {
          setEditModalVisible(false);
          setNewKey('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="请输入新的密钥"
          maxLength={20}
        />
      </Modal>

      <Modal
        title="添加密钥"
        open={addModalVisible}
        onOk={handleAddKey}
        onCancel={() => {
          setAddModalVisible(false);
          setNewKey('');
        }}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="请输入密钥"
          maxLength={20}
        />
      </Modal>
    </div>
  );
};

KeyManager.propTypes = {
  password: PropTypes.string.isRequired,
  onSelectKey: PropTypes.func.isRequired,
  selectedKey: PropTypes.string
};

export default KeyManager; 