import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PasswordModal = ({ onSubmit, onClose, mode }) => {
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'write') {
      if (!password.trim()) {
        alert('请输入密码');
        return;
      }
      // 写信模式只需要密码
      onSubmit({ password });
    } else {
      // 读信模式需要密钥
      if (!key.trim()) {
        alert('请输入密钥');
        return;
      }
      onSubmit({ key });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
      >
        <h2 className="text-2xl font-romantic text-pink-600 mb-6">
          {mode === 'write' ? '请输入密码' : '请输入密钥'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'write' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all"
                placeholder="请输入密码"
              />
              <p className="mt-2 text-sm text-gray-500">
                首次使用此密码将自动创建新密钥
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密钥
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-200 focus:border-pink-400 outline-none transition-all"
                placeholder="请输入密钥"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl"
            >
              确定
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

PasswordModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['read', 'write']).isRequired
};

export default PasswordModal; 