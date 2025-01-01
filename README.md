前言：着急去上学，readme来不及写了，ai随手糊了一个凑合看，下周末回来慢慢改
# Love Mail - 匿名信件系统

Love Mail 是一个浪漫的匿名信件系统，让你可以写下内心最温柔的话语，安全地传递给那个特别的人。
无需注册账号，只需一个密钥，就能开启属于你们的秘密花园。支持精美的文字排版，还可以通过邮件及时收到新的回信提醒。

## 特性

- 🔒 安全的密钥系统
- 📝 支持Markdown格式
- 🎨 优雅的UI设计
- 📧 邮件通知功能
- 🚀 高性能异步处理
- 🛡️ 完善的安全措施

## 技术栈

- 前端：React + Vite + TailwindCSS
- 后端：Express + Node.js
- 数据存储：文件系统
- 邮件服务：Nodemailer

## 安全特性

- MD5密码加密
- 请求频率限制
- XSS防护
- 安全的邮件队列系统

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/youyi0218/love-mail.git
cd love-mail
```

2. 安装依赖
```bash
npm install
```

3. 配置环境
- 复制 `server/data/admin.example.json` 到 `server/data/admin.json`
- 修改 SMTP 配置

4. 启动开发服务器
```bash
npm run dev
```

5. 构建并启动生产服务器
```bash
npm start
```

6. 访问网站
```bash
http://localhost:5520
```
/write 写信件
/admin 后台面板

## 项目结构

```
love-mail/
├── src/                # 前端源码
│   ├── components/     # React组件
│   ├── styles/         # 样式文件
│   └── App.jsx         # 主应用组件
├── server/             # 后端源码
│   ├── data/          # 数据存储
│   ├── modules/       # 核心模块
│   ├── routes/        # 路由处理
│   └── index.js       # 服务器入口
└── public/            # 静态资源
```

## API文档

### 验证密钥
- POST `/api/verify`
- Body: `{ key: string, password?: string, mode: 'read' | 'write' }`

### 回复信件
- POST `/api/reply`
- Body: `{ key: string, content: string }`

### 订阅更新
- POST `/api/subscribe`
- Body: `{ key: string, email: string }`

## 性能优化

- 异步邮件队列
- 请求频率限制
- 文件系统优化

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式
[在线预览](https://love.theyouyi.site)
[我的博客](https://blog.theyouyi.site)  
[我的B站](https://space.bilibili.com/400669188?spm_id_from=333.1007.0.0)