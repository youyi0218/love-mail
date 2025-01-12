import express from 'express';
import crypto from 'crypto';
import {
  verifyKeyAndPassword,
  createNewKey,
  readMessages,
  saveMessage,
  deleteMessage
} from '../modules/core.js';
import { readSubscribers, saveSubscribers } from '../modules/subscription.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 读取密钥列表
async function readKeys(password) {
  try {
    const keysPath = path.join(__dirname, '../data/keys.json');
    let data;
    try {
      data = await fs.promises.readFile(keysPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果文件不存在，返回空数组
        return [];
      }
      throw error;
    }

    const keys = JSON.parse(data);
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    
    // 过滤出属于该密码的密钥
    return Object.entries(keys)
      .filter(([_, value]) => value.password === passwordHash)
      .map(([key, value]) => ({
        key,
        createdAt: value.createdAt
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('读取密钥列表失败:', error);
    throw error;
  }
}

// 读取完整的密钥数据（仅在内部使用）
async function readAllKeys() {
  try {
    const keysPath = path.join(__dirname, '../data/keys.json');
    let data;
    try {
      data = await fs.promises.readFile(keysPath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        // 如果文件不存在，返回空对象
        return {};
      }
      throw error;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('读取密钥列表失败:', error);
    throw error;
  }
}

// 保存密钥列表
async function saveKeys(keys) {
  try {
    const keysPath = path.join(__dirname, '../data/keys.json');
    await fs.promises.writeFile(keysPath, JSON.stringify(keys, null, 2));
  } catch (error) {
    console.error('保存密钥列表失败:', error);
    throw error;
  }
}

// 验证密钥和密码
router.post('/verify', async (req, res, next) => {
  try {
    console.log('\n开始验证流程 ========================');
    console.log('收到验证请求:', req.body);
    const { key, password, mode } = req.body;
    
    if (mode === 'write') {
      // 写信模式只需要密码
      if (!password) {
        console.log('错误: 写信模式未提供密码');
        return res.status(400).json({ 
          success: false,
          message: '请提供密码' 
        });
      }

      // 直接返回成功，不创建新密钥
      res.json({
        success: true,
        message: '密码验证成功'
      });
      return;
    } else {
      // 读信模式需要密钥
      if (!key) {
        console.log('错误: 未提供密钥');
        return res.status(400).json({ 
          success: false,
          message: '请提供密钥' 
        });
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
    }
  } catch (error) {
    console.error('验证密钥时出错:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

// 回复信件
router.post('/reply', async (req, res) => {
  try {
    const { key, content, messageId, createdAt, isUpdate } = req.body;
    
    if (!key || !content) {
      return res.json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证密钥是否存在
    const result = await verifyKeyAndPassword(key);
    if (!result.exists) {
      return res.json({
        success: false,
        message: '密钥不存在'
      });
    }

    // 保存信件
    await saveMessage(key, content, messageId, createdAt);

    res.json({
      success: true,
      message: isUpdate ? '信件已更新' : '信件已保存'
    });
  } catch (error) {
    console.error('保存信件失败:', error);
    res.json({
      success: false,
      message: error.message
    });
  }
});

// 删除信件
router.post('/deleteLetter', async (req, res) => {
  try {
    const { key, messageId } = req.body;
    
    if (!key || !messageId) {
      return res.json({
        success: false,
        message: '缺少必要参数'
      });
    }

    // 验证密钥是否存在
    const result = await verifyKeyAndPassword(key);
    if (!result.exists) {
      return res.json({
        success: false,
        message: '密钥不存在'
      });
    }

    // 删除信件
    await deleteMessage(key, messageId);

    res.json({
      success: true,
      message: '信件已删除'
    });
  } catch (error) {
    console.error('删除信件失败:', error);
    res.json({
      success: false,
      message: error.message
    });
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

// 创建新密钥
router.post('/createKey', async (req, res) => {
  try {
    const { key, password } = req.body;
    if (!key || !password) {
      return res.json({ 
        success: false, 
        message: '请提供密钥和密码' 
      });
    }

    await createNewKey(key, password);
    
    // 创建成功后，立即返回更新后的密钥列表
    const keys = await readKeys(password);
    res.json({ 
      success: true, 
      message: '创建成功',
      keys 
    });
  } catch (error) {
    console.error('创建密钥失败:', error);
    res.json({ 
      success: false, 
      message: error.message || '创建失败' 
    });
  }
});

// 获取密钥列表
router.post('/keys', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.json({ success: false, message: '请提供密码' });
    }

    console.log('获取密钥列表，密码:', password);
    const keys = await readKeys(password);
    console.log('找到的密钥:', keys);
    
    res.json({ 
      success: true, 
      keys 
    });
  } catch (error) {
    console.error('获取密钥列表失败:', error);
    res.json({ 
      success: false, 
      message: '获取密钥列表失败' 
    });
  }
});

// 修改密钥
router.post('/updateKey', async (req, res) => {
  try {
    const { oldKey, newKey, password } = req.body;
    if (!oldKey || !newKey || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const keys = await readAllKeys();
    if (!keys[oldKey]) {
      return res.status(404).json({
        success: false,
        message: '密钥不存在'
      });
    }

    // 验证密码
    const hash = crypto.createHash('md5').update(password).digest('hex');
    if (keys[oldKey].password !== hash) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 检查新密钥是否已存在
    if (keys[newKey]) {
      return res.status(400).json({
        success: false,
        message: '新密钥已存在'
      });
    }

    // 更新密钥
    keys[newKey] = {
      ...keys[oldKey],
      updatedAt: new Date().toISOString()
    };
    delete keys[oldKey];
    await saveKeys(keys);

    res.json({
      success: true,
      message: '密钥修改成功'
    });
  } catch (error) {
    console.error('修改密钥失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

// 删除密钥
router.post('/deleteKey', async (req, res) => {
  try {
    const { key, password } = req.body;
    if (!key || !password) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const keys = await readAllKeys();
    if (!keys[key]) {
      return res.status(404).json({
        success: false,
        message: '密钥不存在'
      });
    }

    // 验证密码
    const hash = crypto.createHash('md5').update(password).digest('hex');
    if (keys[key].password !== hash) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      });
    }

    // 删除密钥
    delete keys[key];
    await saveKeys(keys);

    // 尝试删除相关的消息文件
    try {
      const messagePath = path.join(__dirname, `../messages/${key}.md`);
      await fs.promises.unlink(messagePath);
    } catch (error) {
      // 如果消息文件不存在，忽略错误
      if (error.code !== 'ENOENT') {
        console.error('删除消息文件失败:', error);
      }
    }

    res.json({
      success: true,
      message: '密钥删除成功'
    });
  } catch (error) {
    console.error('删除密钥失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '服务器错误'
    });
  }
});

export default router; 