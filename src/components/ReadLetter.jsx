import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const ReadLetter = ({ letters, onBack, onSubscribe }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('请输入邮箱地址');
      return;
    }
    onSubscribe(email);
    setShowSubscribe(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-pink-600 hover:text-pink-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-2xl font-romantic text-pink-600">
              {letters.length > 1 ? `第 ${currentIndex + 1} 封信` : '信件内容'}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            {letters.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
                  disabled={currentIndex <= 0}
                  className="px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors disabled:opacity-50"
                >
                  上一封
                </button>
                <button
                  onClick={() => setCurrentIndex(Math.min(currentIndex + 1, letters.length - 1))}
                  disabled={currentIndex >= letters.length - 1}
                  className="px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors disabled:opacity-50"
                >
                  下一封
                </button>
              </>
            )}
            <button
              onClick={() => setShowSubscribe(true)}
              className="px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
            >
              订阅更新
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100 to-purple-100 transform -rotate-1 rounded-2xl" />
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('/paper-texture.png')] opacity-10" />
              <div className="relative p-8">
                <div className="prose prose-pink max-w-none">
                  <ReactMarkdown>{letters[currentIndex].content}</ReactMarkdown>
                </div>
                <div className="mt-6 text-right text-sm text-gray-500">
                  {new Date(letters[currentIndex].createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSubscribe && (
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
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                订阅更新提醒
              </h3>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入你的邮箱地址"
                  className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowSubscribe(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl"
                  >
                    订阅
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

ReadLetter.propTypes = {
  letters: PropTypes.arrayOf(
    PropTypes.shape({
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    })
  ).isRequired,
  onBack: PropTypes.func.isRequired,
  onSubscribe: PropTypes.func.isRequired
};

export default ReadLetter; 