import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Envelope from './components/Envelope';
import BalloonBackground from './components/BalloonBackground';
import WriteLetter from './components/WriteLetter';
import ReadLetter from './components/ReadLetter';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PasswordModal from './components/PasswordModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [letters, setLetters] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigate = useNavigate();

  // 根据当前路径设置视图
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/write') {
      setShowPasswordModal(true);
    }
  }, []);

  const handleKeySubmit = async (data) => {
    try {
      setIsLoading(true);
      const mode = window.location.pathname === '/write' ? 'write' : 'read';
      console.log('验证模式:', mode, '请求数据:', data);
      
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...data,
          mode 
        })
      });

      const result = await response.json();
      console.log('验证结果:', result);

      if (!result.success) {
        alert(result.message || '验证失败');
        if (window.location.pathname === '/write') {
          navigate('/');
        }
        return;
      }

      if (mode === 'write') {
        setCurrentKey(result.key);
        setCurrentPassword(data.password);
        navigate('/write');
      } else {
        setCurrentKey(data.key);
        if (result.found) {
          setLetters(result.letters);
        } else {
          alert('未找到对应的信件');
        }
      }
    } catch (error) {
      console.error('验证时出错:', error);
      alert('验证失败，请重试');
      if (window.location.pathname === '/write') {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
      setShowPasswordModal(false);
    }
  };

  const handleWriteComplete = async (content) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: currentKey,
          content,
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('信件保存成功！');
        navigate('/');
      } else {
        alert(result.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (email) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: currentKey,
          email,
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('订阅成功！当有新的回信时，我们会通过邮件通知你。');
      } else {
        alert(result.message || '订阅失败');
      }
    } catch (error) {
      console.error('订阅失败:', error);
      alert('订阅失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setLetters(null);
    setCurrentKey('');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-200 relative overflow-hidden">
      <BalloonBackground />
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={
              letters ? (
                <ReadLetter 
                  letters={letters} 
                  onBack={handleBack}
                  onSubscribe={handleSubscribe}
                />
              ) : (
                <div className="min-h-screen flex items-center justify-center">
                  <Envelope onOpen={() => setShowPasswordModal(true)} isLoading={isLoading} />
                </div>
              )
            }
          />
          <Route
            path="/write"
            element={
              <WriteLetter 
                onSubmit={handleWriteComplete}
                onBack={handleBack} 
                isLoading={isLoading}
                password={currentPassword}
              />
            }
          />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </ErrorBoundary>
      {showPasswordModal && (
        <PasswordModal
          onSubmit={handleKeySubmit}
          onClose={() => {
            setShowPasswordModal(false);
            if (window.location.pathname === '/write') {
              navigate('/');
            }
          }}
          mode={window.location.pathname === '/write' ? 'write' : 'read'}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </div>
  );
} 