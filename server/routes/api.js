import express from 'express';
import {
  verifyKeyAndPassword,
  createNewKey,
  readMessages,
  saveMessage
} from '../modules/core.js';
import { readSubscribers, saveSubscribers } from '../modules/subscription.js';

const router = express.Router();

// 验证密钥和密码
router.post('/verify', async (req, res, next) => {
  try {
    console.log('\n开始验证流程 ========================');
    console.log('收到验证请求:', req.body);
    const { key, password, mode } = req.body;
    
    if (!key) {
      console.log('错误: 未提供密钥');
      return res.status(400).json({ 
        success: false,
        message: '请提供密钥' 
      });
    }

    if (mode === 'write') {
      console.log('写信模式 - 开始验证密码');
      // 写信模式需要验证密码
      if (!password) {
        console.log('错误: 写信模式未提供密码');
        return res.status(400).json({ 
          success: false,
          message: '写信模式需要提供密码' 
        });
      }

      const { exists, valid } = await verifyKeyAndPassword(key, password);
      console.log('密钥验证结果:', { exists, valid });

      if (!exists) {
        // 如果密钥不存在,创建新密钥
        console.log('密钥不存在，创建新密钥');
        await createNewKey(key, password);
        console.log('创建新密钥成功');
        res.json({
          success: true,
          found: false,
          created: true,
          message: '已创建新密钥'
        });
        return;
      }

      if (!valid) {
        console.log('密码验证失败');
        return res.status(401).json({
          success: false,
          message: '密码不正确'
        });
      }
      console.log('密码验证成功');
    }

    // 读取信件
    console.log('开始读取信件');
    const messages = await readMessages(key);
    console.log('读取到的信件数量:', messages.length);

    // 返回信件内容
    console.log('验证流程完成 ========================\n');
    res.json({
      success: true,
      found: messages.length > 0,
      letters: messages,
      message: messages.length > 0 ? undefined : '未找到对应的信件'
    });

  } catch (error) {
    console.error('验证密钥时出错:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

// 保存信件
router.post('/reply', async (req, res, next) => {
  try {
    const { key, content } = req.body;
    
    if (!key || !content) {
      return res.status(400).json({ 
        success: false,
        message: '缺少必要参数' 
      });
    }

    await saveMessage(key, content);
    res.json({ success: true });
  } catch (error) {
    console.error('保存信件时出错:', error);
    next(error);
  }
});

// 订阅更新
router.post('/subscribe', async (req, res) => {
  try {
    console.log('收到订阅请求:', req.body);
    const { key, email } = req.body;
    
    if (!key || !email) {
      return res.status(400).json({ 
        success: false,
        message: '缺少必要参数' 
      });
    }

    // 读取现有订阅者
    const subscribers = await readSubscribers();
    
    // 初始化该密钥的订阅列表（如果不存在）
    if (!subscribers[key]) {
      subscribers[key] = [];
    }
    
    // 检查是否已经订阅
    if (subscribers[key].includes(email)) {
      return res.json({
        success: true,
        message: '你已经订阅过了'
      });
    }
    
    // 添加新订阅者
    subscribers[key].push(email);
    
    // 保存更新后的订阅者列表
    await saveSubscribers(subscribers);
    
    console.log('订阅成功:', { key, email });
    res.json({ 
      success: true,
      message: '订阅成功'
    });
  } catch (error) {
    console.error('处理订阅请求时出错:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

export default router; 