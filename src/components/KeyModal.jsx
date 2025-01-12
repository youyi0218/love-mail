import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyModal = ({ isOpen, onClose, onSubmit }) => {
  const [key, setKey] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('请输入密钥');
      return;
    }
    onSubmit({ key, isNewLetter: isCreatingNew });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-xl w-96"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-romantic text-center mb-6">
              {isCreatingNew ? '新建信件' : '打开信件'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="请输入密钥..."
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full p-3 border-2 border-red-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors font-serif"
                  required
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(!isCreatingNew)}
                  className="px-6 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  {isCreatingNew ? '打开已有信件' : '新建信件'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  确认
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyModal; 