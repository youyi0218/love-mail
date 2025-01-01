import express from 'express';
import crypto from 'crypto';
import {
  readAdminConfig,
  saveAdminConfig,
  readStats,
  resetStats,
  verifyAdminPassword,
  updateEmailTemplate
} from '../modules/admin.js';

const router = express.Router();

// 获取管理员状态
router.get('/status', async (req, res) => {
  try {
    console.log('[管理员状态] 开始获取...');
    const config = await readAdminConfig();
    console.log('[管理员状态] 配置:', config);
    res.json({ 
      success: true,
      initialized: config.initialized 
    });
    console.log('[管理员状态] 响应成功');
  } catch (error) {
    console.error('[管理员状态] 错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 初始化管理员密码
router.post('/initialize', async (req, res) => {
  try {
    const { password } = req.body;
    const config = await readAdminConfig();
    
    if (config.initialized) {
      return res.status(400).json({
        success: false,
        message: '管理员密码已设置，无法重新初始化'
      });
    }
    
    const hash = crypto.createHash('md5').update(password).digest('hex');
    config.password = hash;
    config.initialized = true;
    await saveAdminConfig(config);
    
    res.json({ success: true });
  } catch (error) {
    console.error('初始化管理员密码时出错:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 验证管理员密码
router.post('/auth', async (req, res) => {
  try {
    const { password } = req.body;
    const config = await readAdminConfig();
    
    if (!config.initialized) {
      return res.status(400).json({
        success: false,
        message: '管理员密码尚未设置'
      });
    }
    
    if (!verifyAdminPassword(config, password)) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('验证管理员密码时出错:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取管理员数据
router.get('/data', async (req, res) => {
  try {
    console.log('[管理员数据] 开始获取...');
    const config = await readAdminConfig();
    const stats = await readStats();
    console.log('[管理员数据] 配置:', config);
    console.log('[管理员数据] 统计:', stats);
    
    const response = {
      success: true,
      smtp: config.smtp || {
        host: '',
        port: '',
        secure: true,
        user: '',
        pass: ''
      },
      stats: stats || {
        visits: 0,
        lastReset: new Date().toISOString()
      },
      emailTemplate: config.emailTemplate || {
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
    
    console.log('[管理员数据] 响应:', response);
    res.json(response);
    console.log('[管理员数据] 响应成功');
  } catch (error) {
    console.error('[管理员数据] 错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新SMTP配置
router.post('/smtp', async (req, res) => {
  try {
    const config = await readAdminConfig();
    config.smtp = req.body;
    await saveAdminConfig(config);
    
    res.json({ success: true });
  } catch (error) {
    console.error('更新SMTP配置时出错:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 重置统计数据
router.post('/reset-stats', async (req, res) => {
  try {
    const stats = await resetStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('重置统计数据时出错:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新邮件模板
router.post('/email-template', async (req, res) => {
  try {
    console.log('[邮件模板] 开始更新...');
    console.log('[邮件模板] 请求数据:', req.body);
    const template = await updateEmailTemplate(req.body);
    console.log('[邮件模板] 更新后的模板:', template);
    res.json({ success: true, template });
    console.log('[邮件模板] 响应成功');
  } catch (error) {
    console.error('[邮件模板] 错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

export default router; 