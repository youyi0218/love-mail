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
- 🖋️ 使用霞鹜文楷GB字体

## 技术栈

- 前端：React 18 + Vite 5 + TailwindCSS 3
- UI组件：Ant Design 5 + Framer Motion
- 后端：Express 4 + Node.js
- 数据存储：文件系统
- 邮件服务：Nodemailer + SMTP

## 安全特性

- MD5密码加密
- 请求频率限制
- XSS防护
- 安全的邮件队列系统
- CSP安全策略
- 防重放攻击

## 快速开始

### 开发模式

1. 克隆仓库
```bash
git clone https://github.com/youyi0218/love-mail.git
cd love-mail
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
# 终端1：启动前端开发服务器
npm run dev

# 终端2：启动后端服务器
npm run server
```

4. 访问开发环境
```
前端：http://localhost:5173
后端：http://localhost:5520
```

### 生产模式
#### 自动构建
1. 克隆并进入项目
```bash
git clone https://github.com/youyi0218/love-mail.git
cd love-mail
```

2. 一键启动自动构建：
```bash
npm start
```

3. 访问网站
```
http://localhost:5520
```

#### 手动构建

1. 克隆并进入项目
```bash
git clone https://github.com/youyi0218/love-mail.git
cd love-mail
```

2. 安装依赖
```bash
npm install
```

3. 构建前端
```bash
npm run build
```

4. 启动服务
```bash
npm run server
```

5. 访问网站
```
http://localhost:5520
```

## 路由说明

- `/` - 首页
- `/write` - 写信页面
- `/admin` - 管理后台
  - SMTP服务配置
  - 访问统计
  - 邮件模板管理

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
├── public/            # 静态资源
│   ├── fonts/         # 字体文件
│   └── images/        # 图片资源
└── dist/              # 构建输出目录
```

## API文档

### 验证密钥
- POST `/api/verify`
- Body: `{ key: string, password?: string, mode: 'read' | 'write' }`

### 回复信件
- POST `/api/reply`
- Body: `{ key: string, content: string, messageId?: string, createdAt?: string, isUpdate?: boolean }`

### 订阅更新
- POST `/api/subscribe`
- Body: `{ key: string, email: string }`

### 删除信件
- POST `/api/deleteLetter`
- Body: `{ key: string, messageId: string }`

## 性能优化

- 异步邮件队列
- 请求频率限制
- 文件系统优化
- 图片资源压缩
- 代码分割
- 路由懒加载

## 后记
由于信件内容是存储在本地的，而vercel无法存储，所以不做vercel适配，你可以修改把信件内容储存到webdav之类的东西，因为我没有这样的需求，所以不提供相关帮助（别问代码怎么改，我也不知道）

## 字体许可

本项目使用了[霞鹜文楷GB](https://github.com/lxgw/LxgwWenkaiGB)字体，该字体基于 [SIL Open Font License 1.1](https://scripts.sil.org/OFL) 协议授权。

## 联系方式

- [在线站点](https://love.theyouyi.site)
- [我的博客](https://blog.theyouyi.site)
- [我的B站（~千粉女装跳舞~）](https://space.bilibili.com/400669188)