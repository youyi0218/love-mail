import React from 'react';
import { Button } from 'antd';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('组件错误:', error);
    console.error('错误详情:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#fff1f0', 
          border: '1px solid #ffccc7',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <h3 style={{ color: '#cf1322', marginBottom: '16px' }}>
            组件加载失败
          </h3>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            {this.state.error?.message || '发生未知错误'}
          </p>
          <Button 
            type="primary" 
            danger
            onClick={() => window.location.reload()}
          >
            刷新页面
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 