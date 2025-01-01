import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const PasswordModal = ({ onSubmit, onClose, mode = 'read' }) => {
  const [key, setKey] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 自动聚焦到输入框
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.querySelector('input[name="key"]');
      if (input) {
        input.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!key.trim()) {
      alert('请输入密钥');
      return;
    }

    if (mode === 'write' && !password.trim()) {
      alert('请输入密码');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ 
        key: key.trim(), 
        password: mode === 'write' ? password.trim() : undefined 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-2xl font-romantic text-pink-600 mb-6">
                {mode === 'write' ? '请输入密钥和密码' : '请输入心动密钥'}
              </h3>
              <input
                type="text"
                name="key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none text-center font-serif transition-all"
                placeholder="输入密钥"
                disabled={isLoading}
              />
              {mode === 'write' && (
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 mt-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none text-center font-serif transition-all"
                  placeholder="输入密码"
                  disabled={isLoading}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
              >
                {isLoading ? '验证中...' : '确认'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full px-6 py-2 bg-gradient-to-r from-purple-400 to-indigo-400 text-white rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
              >
                取消
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

PasswordModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['read', 'write'])
};

export default PasswordModal; 