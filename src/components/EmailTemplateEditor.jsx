import React, { useState, useEffect } from 'react';
import { Input, Button, message, Spin } from 'antd';
import ErrorBoundary from './ErrorBoundary';

const { TextArea } = Input;

function EmailTemplateEditor() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  // 加载模板数据
  useEffect(() => {
    loadTemplate();
  }, []);

  // 获取模板
  const loadTemplate = async () => {
    try {
      setLoading(true);
      console.log('开始加载邮件模板...');
      
      const res = await fetch('/api/admin/data');
      console.log('API响应:', res);
      
      const data = await res.json();
      console.log('获取到的数据:', data);
      
      if (!data.success) {
        throw new Error(data.message || '获取数据失败');
      }
      
      if (data.emailTemplate) {
        console.log('设置邮件模板:', data.emailTemplate);
        setSubject(data.emailTemplate.subject || '');
        setContent(data.emailTemplate.template || '');
      } else {
        console.log('未找到邮件模板，使用空值');
      }
    } catch (error) {
      console.error('获取模板失败:', error);
      message.error('获取模板失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 保存模板
  const handleSave = async () => {
    if (!subject || !content) {
      message.error('主题和内容不能为空');
      return;
    }

    try {
      setLoading(true);
      console.log('开始保存邮件模板...');
      
      const res = await fetch('/api/admin/email-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          template: content
        })
      });
      
      console.log('保存响应:', res);
      const data = await res.json();
      console.log('保存结果:', data);

      if (data.success) {
        message.success('保存成功');
      } else {
        throw new Error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>邮件主题：</div>
        <Input
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="请输入邮件主题"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          邮件内容：
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
            (支持变量: {'{{key}}'} - 密钥, {'{{url}}'} - 网站地址)
          </span>
        </div>
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="请输入邮件内容，支持HTML格式"
          autoSize={{ minRows: 10, maxRows: 20 }}
        />
      </div>

      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={handleSave} loading={loading}>
          保存
        </Button>
      </div>
    </div>
  );
}

export default function EmailTemplateEditorWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <EmailTemplateEditor />
    </ErrorBoundary>
  );
} 