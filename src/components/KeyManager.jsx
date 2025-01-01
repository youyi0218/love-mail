import React, { useState, useEffect } from 'react';

const KeyManager = () => {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setKeys(data.keys);
    } catch (error) {
      setError('获取密钥列表失败');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: newKey, description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setSuccess('密钥创建成功！');
      setNewKey('');
      setDescription('');
      fetchKeys();
    } catch (error) {
      setError(error.message || '创建密钥失败');
    }
  };

  return (
    <div className="fixed top-4 right-4 p-4 bg-white rounded-lg shadow-xl">
      <h2 className="text-xl font-bold mb-4">密钥管理</h2>
      
      {/* 密钥列表 */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">现有密钥描述：</h3>
        <ul className="list-disc pl-5">
          {keys.map((description, index) => (
            <li key={index}>{description}</li>
          ))}
        </ul>
      </div>

      {/* 创建新密钥表单 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            placeholder="新密钥"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="密钥描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          创建新密钥
        </button>
      </form>

      {/* 错误提示 */}
      {error && (
        <div className="mt-3 text-red-500 text-sm">{error}</div>
      )}

      {/* 成功提示 */}
      {success && (
        <div className="mt-3 text-green-500 text-sm">{success}</div>
      )}
    </div>
  );
};

export default KeyManager; 