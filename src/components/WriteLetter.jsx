import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const WriteLetter = ({ onSubmit, onBack, isLoading }) => {
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'split', 'preview'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('请输入信件内容');
      return;
    }
    onSubmit(content);
  };

  const insertMarkdown = (type) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let insertion = '';

    switch (type) {
      case 'bold':
        insertion = `**${text.substring(start, end) || '粗体文字'}**`;
        break;
      case 'italic':
        insertion = `*${text.substring(start, end) || '斜体文字'}*`;
        break;
      case 'link':
        insertion = `[${text.substring(start, end) || '链接文字'}](url)`;
        break;
      case 'quote':
        insertion = `\n> ${text.substring(start, end) || '引用文字'}\n`;
        break;
      case 'code':
        insertion = `\`${text.substring(start, end) || '代码'}\``;
        break;
      case 'list':
        insertion = `\n- ${text.substring(start, end) || '列表项'}\n`;
        break;
      default:
        return;
    }

    const newContent = text.substring(0, start) + insertion + text.substring(end);
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + insertion.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-romantic text-pink-600">写一封信</h2>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                >
                  返回
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl">
                <div className="flex gap-2 mr-6">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('bold')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="粗体"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 0 0 0-8H6v8zm0 0h10a4 4 0 0 1 0 8H6v-8z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('italic')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="斜体"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l-4 16M6 16l8-8M6 8l8 8" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('link')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="链接"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('quote')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="引用"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10.5h2.5a2.5 2.5 0 0 1 0 5H8m0-5v7h3.375c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H8v3zm8-3h-3v3h2.5a2.5 2.5 0 0 1 0 5H13m0 2h3.375c.621 0 1.125-.504 1.125-1.125V8.625c0-.621-.504-1.125-1.125-1.125H13v7z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('code')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="代码"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('list')}
                    className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
                    title="列表"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'edit' 
                        ? 'bg-pink-100 text-pink-600' 
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'split'
                        ? 'bg-pink-100 text-pink-600'
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                  >
                    双栏
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-pink-100 text-pink-600'
                        : 'text-gray-600 hover:text-pink-600'
                    }`}
                  >
                    预览
                  </button>
                </div>
              </div>

              <div className={`min-h-[60vh] relative ${viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}`}>
                {(viewMode === 'edit' || viewMode === 'split') && (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在这里写下你的心意..."
                    className="w-full h-full min-h-[60vh] p-6 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none resize-none font-serif transition-all"
                    disabled={isLoading}
                  />
                )}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className="prose prose-pink max-w-none min-h-[60vh] p-6 bg-pink-50 rounded-xl overflow-auto">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !content.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                >
                  {isLoading ? '保存中...' : '寄出信件'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

WriteLetter.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

WriteLetter.defaultProps = {
  isLoading: false
};

export default WriteLetter; 