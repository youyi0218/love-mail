import fs from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

const ADMIN_FILE = join(process.cwd(), 'server', 'data', 'admin.json');
const STATS_FILE = join(process.cwd(), 'server', 'data', 'stats.json');

// 读取管理员配置
export async function readAdminConfig() {
  try {
    console.log('[配置] 开始读取配置文件...');
    const content = await fs.readFile(ADMIN_FILE, 'utf-8');
    console.log('[配置] 读取到的内容:', content);
    const config = JSON.parse(content);
    console.log('[配置] 解析后的配置:', config);
    return config;
  } catch (error) {
    console.log('[配置] 读取失败:', error.message);
    if (error.code === 'ENOENT') {
      console.log('[配置] 文件不存在，创建默认配置');
      const defaultConfig = {
        initialized: false,
        password: null,
        smtp: {
          host: '',
          port: '',
          secure: 'none',
          user: '',
          pass: '',
          from: '',
          fromName: ''
        },
        emailTemplate: {
          subject: '💌 你关注的信件有了新的回复',
          template: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #e11d48;">💌 收到新的信件</h2>
  <p style="font-size: 16px; line-height: 1.5;">你关注的信件有了新的回复，请使用密钥 <strong>{{key}}</strong> 查看最新内容。</p>
  <p style="font-size: 16px; line-height: 1.5;">点击下面的链接前往查看：</p>
  <a href="{{url}}" style="display: inline-block; background: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">查看信件</a>
</div>`
        }
      };
      console.log('[配置] 默认配置:', defaultConfig);
      await saveAdminConfig(defaultConfig);
      console.log('[配置] 默认配置已保存');
      return defaultConfig;
    }
    console.error('[配置] 严重错误:', error);
    throw error;
  }
}

// 保存管理员配置
export async function saveAdminConfig(config) {
  try {
    console.log('[配置] 开始保存配置...');
    console.log('[配置] 要保存的数据:', config);
    await fs.writeFile(ADMIN_FILE, JSON.stringify(config, null, 2));
    console.log('[配置] 保存成功');
  } catch (error) {
    console.error('[配置] 保存失败:', error);
    throw error;
  }
}

// 读取统计数据
export async function readStats() {
  try {
    const content = await fs.readFile(STATS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        visits: 0,
        lastReset: new Date().toISOString()
      };
    }
    throw error;
  }
}

// 重置统计数据
export async function resetStats() {
  const stats = {
    visits: 0,
    lastReset: new Date().toISOString()
  };
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
  return stats;
}

// 验证管理员密码
export function verifyAdminPassword(config, password) {
  const hash = crypto.createHash('md5').update(password).digest('hex');
  return config.password === hash;
}

// 访问统计中间件
export async function statsMiddleware(req, res, next) {
  try {
    let stats = { visits: 0, lastReset: new Date().toISOString() };
    try {
      const content = await fs.readFile(STATS_FILE, 'utf-8');
      stats = JSON.parse(content);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    stats.visits++;
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
    next();
  } catch (error) {
    console.error('统计访问量时出错:', error);
    next();
  }
}

// 更新邮件模板
export async function updateEmailTemplate(template) {
  try {
    console.log('[邮件模板] 开始更新...');
    console.log('[邮件模板] 新模板:', template);
    const config = await readAdminConfig();
    config.emailTemplate = template;
    await saveAdminConfig(config);
    console.log('[邮件模板] 更新成功');
    return config.emailTemplate;
  } catch (error) {
    console.error('[邮件模板] 更新失败:', error);
    throw error;
  }
} 