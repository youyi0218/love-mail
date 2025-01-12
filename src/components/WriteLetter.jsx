import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import KeyManager from './KeyManager';
import { message, Drawer, Button, Modal } from 'antd';
import { MenuOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const WriteLetter = ({ onSubmit, onBack, isLoading, password }) => {
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState('edit');
  const [selectedKey, setSelectedKey] = useState(null);
  const [letters, setLetters] = useState([]);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(null);

  // 加载历史信件
  const loadLetters = async (key) => {
    if (!key) {
      setLetters([]);
      return;
    }

    try {
      setLoadingLetters(true);
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          key,
          mode: 'read'
        })
      });

      const result = await response.json();
      if (result.success && result.found) {
        setLetters(result.letters);
      } else {
        setLetters([]);
      }
    } catch (error) {
      console.error('加载信件失败:', error);
      message.error('加载信件失败');
    } finally {
      setLoadingLetters(false);
    }
  };

  // 当选中的密钥改变时，加载对应的信件
  useEffect(() => {
    loadLetters(selectedKey);
  }, [selectedKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      message.error('请输入信件内容');
      return;
    }
    if (!selectedKey) {
      message.error('请先选择一个密钥');
      return;
    }
    
    try {
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: selectedKey,
          content: content.trim(),
          messageId: currentLetter?.id,
          createdAt: currentLetter?.createdAt,
          isUpdate: Boolean(currentLetter)
        })
      });

      const result = await response.json();
      if (result.success) {
        message.success(currentLetter ? '信件已更新' : '信件已寄出');
        setContent('');
        setCurrentLetter(null);
        // 重新加载信件列表
        loadLetters(selectedKey);
      } else {
        message.error(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    }
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

  // 添加删除信件的处理函数
  const handleDeleteLetter = async (letter, e) => {
    e.stopPropagation(); // 阻止点击事件冒泡
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这封信件吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch('/api/deleteLetter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              key: selectedKey,
              messageId: letter.id
            })
          });

          const result = await response.json();
          if (result.success) {
            message.success('删除成功');
            // 如果正在编辑这封信，清空编辑器
            if (currentLetter?.id === letter.id) {
              setContent('');
              setCurrentLetter(null);
            }
            // 重新加载信件列表
            loadLetters(selectedKey);
          } else {
            message.error(result.message || '删除失败');
          }
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败，请重试');
        }
      }
    });
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto">
        {/* 移动端工具栏 */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button
            onClick={() => setShowKeyManager(true)}
            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <MenuOutlined /> 密钥管理
          </button>
          <button
            onClick={() => setShowLetters(true)}
            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <MenuOutlined /> 历史信件
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧密钥管理 - 桌面端 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <KeyManager 
              password={password} 
              onSelectKey={setSelectedKey}
              selectedKey={selectedKey}
            />
          </div>

          {/* 移动端密钥管理抽屉 */}
          <Drawer
            title="密钥管理"
            placement="left"
            onClose={() => setShowKeyManager(false)}
            open={showKeyManager}
            width={320}
          >
            <KeyManager 
              password={password} 
              onSelectKey={(key) => {
                setSelectedKey(key);
                setShowKeyManager(false);
              }}
              selectedKey={selectedKey}
            />
          </Drawer>

          {/* 中间内容区 */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="h-20 flex items-center justify-between">
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

              {/* 编辑器工具栏和内容 */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-xl overflow-x-auto">
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('edit')}
                      className={`whitespace-nowrap px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
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
                      className={`whitespace-nowrap px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'split'
                          ? 'bg-pink-100 text-pink-600'
                          : 'text-gray-600 hover:text-pink-600'
                      } hidden sm:block`}
                    >
                      双栏
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('preview')}
                      className={`whitespace-nowrap px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'preview'
                          ? 'bg-pink-100 text-pink-600'
                          : 'text-gray-600 hover:text-pink-600'
                      }`}
                    >
                      预览
                    </button>
                  </div>
                </div>

                <div className={`min-h-[60vh] relative ${viewMode === 'split' ? 'hidden sm:grid sm:grid-cols-2 sm:gap-4' : ''}`}>
                  {(viewMode === 'edit' || viewMode === 'split') && (
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="在这里写下你的心意..."
                      className="w-full h-full min-h-[60vh] p-4 sm:p-6 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none resize-none font-serif transition-all"
                      disabled={isLoading}
                    />
                  )}
                  {(viewMode === 'preview' || viewMode === 'split') && (
                    <div className="prose prose-pink max-w-none min-h-[60vh] p-4 sm:p-6 bg-pink-50 rounded-xl overflow-auto">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  {currentLetter && (
                    <button
                      type="button"
                      onClick={() => {
                        setContent('');
                        setCurrentLetter(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                    >
                      取消编辑
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !content.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl hover:from-pink-500 hover:to-rose-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 font-medium"
                  >
                    {isLoading ? '保存中...' : currentLetter ? '更新信件' : '寄出信件'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* 右侧历史信件 - 桌面端 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 h-full flex flex-col">
              <div className="h-20 flex items-center">
                <h2 className="text-2xl font-romantic text-pink-600">历史信件</h2>
              </div>
              {loadingLetters ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-500">加载中...</div>
                </div>
              ) : letters.length > 0 ? (
                <div className="space-y-4 flex-1 overflow-auto">
                  {letters.map((letter, index) => (
                    <div
                      key={index}
                      className="p-4 bg-pink-50 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors relative group"
                      onClick={() => {
                        setContent(letter.content);
                        setCurrentLetter(letter);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-600">
                          {new Date(letter.createdAt).toLocaleString()}
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteLetter(letter, e)}
                        />
                      </div>
                      <div className="text-sm text-gray-800 line-clamp-3">
                        {letter.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-500">
                    {selectedKey ? '暂无信件' : '请选择密钥'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 移动端历史信件抽屉 */}
          <Drawer
            title="历史信件"
            placement="right"
            onClose={() => setShowLetters(false)}
            open={showLetters}
            width={320}
          >
            <div className="space-y-4">
              {loadingLetters ? (
                <div className="text-center text-gray-500">加载中...</div>
              ) : letters.length > 0 ? (
                letters.map((letter, index) => (
                  <div
                    key={index}
                    className="p-4 bg-pink-50 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors relative group"
                    onClick={() => {
                      setContent(letter.content);
                      setCurrentLetter(letter);
                      setShowLetters(false);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-600">
                        {new Date(letter.createdAt).toLocaleString()}
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteLetter(letter, e)}
                      />
                    </div>
                    <div className="text-sm text-gray-800 line-clamp-3">
                      {letter.content}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  {selectedKey ? '暂无信件' : '请选择密钥'}
                </div>
              )}
            </div>
          </Drawer>
        </div>
      </div>
    </div>
  );
};

WriteLetter.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  password: PropTypes.string.isRequired
};

WriteLetter.defaultProps = {
  isLoading: false
};

export default WriteLetter; 