import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Tabs, Card, Input, Button, Form, Switch, message, Select, Modal } from 'antd';
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
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
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

  // 测试SMTP服务
  const handleTestSmtp = async () => {
    if (!testEmail) {
      message.error('请输入测试邮箱地址');
      return;
    }
    try {
      setIsTestingSmtp(true);
      const response = await fetch('/api/admin/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '发送失败');
      }

      if (data.success) {
        message.success('测试邮件已发送！请检查收件箱');
        setIsTestModalVisible(false);
        setTestEmail('');
      } else {
        throw new Error(data.message || '发送失败');
      }
    } catch (error) {
      console.error('[SMTP测试] 失败:', error);
      message.error(error.message || '测试失败，请检查SMTP配置是否正确');
    } finally {
      setIsTestingSmtp(false);
    }
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
                  <label className="block text-sm font-medium text-gray-700">SMTP服务器地址</label>
                  <Input
                    value={smtpConfig.host}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="例如: smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">端口号</label>
                  <Input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, port: e.target.value }))}
                    placeholder="例如: 465(SSL) 或 587(TLS)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">加密方式</label>
                  <Select
                    value={smtpConfig.secure}
                    onChange={(value) => setSmtpConfig(prev => ({ ...prev, secure: value }))}
                    style={{ width: '100%' }}
                  >
                    <Select.Option value="ssl">SSL</Select.Option>
                    <Select.Option value="tls">TLS</Select.Option>
                    <Select.Option value="none">不加密</Select.Option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">用户名</label>
                  <Input
                    value={smtpConfig.user}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, user: e.target.value }))}
                    placeholder="SMTP用户名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">密码</label>
                  <Input.Password
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, pass: e.target.value }))}
                    placeholder="SMTP密码或授权码"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">发信地址</label>
                  <Input
                    value={smtpConfig.from}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, from: e.target.value }))}
                    placeholder="发件人邮箱地址"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">显示名称</label>
                  <Input
                    value={smtpConfig.fromName}
                    onChange={(e) => setSmtpConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    placeholder="发件人显示名称"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button type="primary" htmlType="submit" loading={isLoading}>
                    保存设置
                  </Button>
                  <Button 
                    onClick={() => setIsTestModalVisible(true)}
                    disabled={!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass}
                  >
                    测试服务
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

      <Modal
        title="测试SMTP服务"
        open={isTestModalVisible}
        onCancel={() => {
          setIsTestModalVisible(false);
          setTestEmail('');
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setIsTestModalVisible(false);
              setTestEmail('');
            }}
          >
            取消
          </Button>,
          <Button 
            key="test" 
            type="primary" 
            loading={isTestingSmtp}
            onClick={handleTestSmtp}
          >
            测试
          </Button>
        ]}
      >
        <div className="space-y-4">
          <p>请输入用于测试的邮箱地址：</p>
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="test@example.com"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel; 