import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import adminRouter from './routes/admin.js';
import apiRouter from './routes/api.js';
import { statsMiddleware } from './modules/admin.js';
import { ensureDirectories } from './modules/core.js';
import { ensureSubscribersFile } from './modules/subscription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5520;

// 中间件
app.use(express.json());
app.use(cors());

// 请求频率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: { 
    success: false,
    message: '请求过于频繁，请稍后再试'
  }
});

// API路由要在静态文件服务之前
app.use('/api', limiter);
app.use('/api/admin', adminRouter);
app.use('/api', apiRouter);
app.use(statsMiddleware);

// 静态文件服务
app.use(express.static(join(__dirname, '../dist')));

// 所有其他请求都返回index.html（支持前端路由）
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/index.html'));
  }
});

// 初始化
async function initialize() {
  await ensureDirectories();
  await ensureSubscribersFile();
  console.log('初始化完成');
}

// 启动服务器
initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在: http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('初始化失败:', error);
  process.exit(1);
}); 