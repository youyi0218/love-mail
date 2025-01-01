import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Input, Button, Form, Switch, message } from 'antd';
import EmailTemplateEditor from './EmailTemplateEditor';

const { TabPane } = Tabs;

const AdminPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [password, setPassword] = useState('');
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    secure: true,
    user: '',
    pass: ''
  });
  const [stats, setStats] = useState({
    visits: 0,
    lastReset: ''
  });
  const navigate = useNavigate();

  // 检查是否已设置管理员密码
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/admin/status?t=${timestamp}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const data = await response.json();
        console.log('管理员状态:', data);
        setIsInitialized(data.initialized);
        if (localStorage.getItem('adminAuthenticated') === 'true') {
          setIsAuthenticated(true);
          await fetchData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('检查管理员状态失败:', error);
        message.error('检查管理员状态失败');
        navigate('/');
      }
    };
    checkAdminStatus();
  }, [navigate]);

  // 获取SMTP配置和统计数据
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/data?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      console.log('管理员数据:', data);
      if (!data.success) {
        throw new Error(data.message || '获取数据失败');
      }
      setSmtpConfig(data.smtp || {
        host: '',
        port: '',
        secure: true,
        user: '',
        pass: ''
      });
      setStats(data.stats || {
        visits: 0,
        lastReset: new Date().toISOString()
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 验证密码
  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminAuthenticated', 'true');
        setIsAuthenticated(true);
        await fetchData();
      } else {
        throw new Error(data.message || '密码错误');
      }
    } catch (error) {
      console.error('验证失败:', error);
      message.error('验证失败: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 设置管理员密码
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password.trim() || password.length < 6) {
      alert('请设置至少6位的密码');
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        alert('密码设置成功！');
        setIsAuthenticated(true);
        setIsInitialized(true);
        fetchData();
      } else {
        alert(data.message || '设置失败');
      }
    } catch (error) {
      console.error('设置失败:', error);
      alert('设置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新SMTP配置
  const handleUpdateSmtp = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smtpConfig)
      });
      const data = await response.json();
      if (data.success) {
        alert('SMTP配置已更新！');
      } else {
        alert(data.message || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置统计数据
  const handleResetStats = async () => {
    if (!window.confirm('确定要重置统计数据吗？')) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/reset-stats', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert('统计数据已重置！');
        fetchData();
      } else {
        alert(data.message || '重置失败');
      }
    } catch (error) {
      console.error('重置失败:', error);
      alert('重置失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isInitialized ? '管理员验证' : '初始化管理员密码'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isInitialized ? '请输入管理员密码' : '首次访问需要设置管理员密码'}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={isInitialized ? handleAuth : handleSetPassword}>
            <div>
              <label htmlFor="password" className="sr-only">密码</label>
              <Input.Password
                id="password"
                required
                placeholder={isInitialized ? '输入管理员密码' : '设置管理员密码 (至少6位)'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
              >
                {isLoading ? '处理中...' : (isInitialized ? '验证' : '设置密码')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card 
        title="管理面板" 
        extra={
          <Button onClick={handleLogout} type="link">
            退出登录
          </Button>
        }
      >
        <Tabs defaultActiveKey="smtp">
          <TabPane tab="SMTP设置" key="smtp">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">SMTP 配置</h2>
              <form onSubmit={handleUpdateSmtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">主机</label>
                  <Input
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">端口</label>
                  <Input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                    placeholder="465"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">用户名</label>
                  <Input
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">密码</label>
                  <Input.Password
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
                    placeholder="邮箱密码或授权码"
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">安全连接</label>
                  <Switch
                    checked={smtpConfig.secure}
                    onChange={(checked) => setSmtpConfig(prev => ({ ...prev, secure: checked }))}
                  />
                </div>
                <div>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
                    保存
                  </Button>
                </div>
              </form>
            </div>
          </TabPane>
          
          <TabPane tab="访问统计" key="stats">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">访问统计</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-lg">总访问量：{stats.visits}</p>
                  <p className="text-sm text-gray-500">
                    上次重置：{new Date(stats.lastReset).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Button onClick={handleResetStats} loading={isLoading}>
                    重置统计
                  </Button>
                </div>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="邮件模板" key="template">
            <EmailTemplateEditor />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminPanel; 