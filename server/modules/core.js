import fs from 'fs/promises';
import { join, dirname } from 'path';
import { glob } from 'glob';
import crypto from 'crypto';
import { sendNotification } from './subscription.js';

const MESSAGES_DIR = join(process.cwd(), 'server', 'messages');
const KEYS_FILE = join(process.cwd(), 'server', 'data', 'keys.json');
const SALT_ROUNDS = 10;

// 读取密钥信息
export async function readKeys() {
  try {
    const content = await fs.readFile(KEYS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// 保存密钥信息
export async function saveKeys(keys) {
  await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// 验证密钥和密码
export async function verifyKeyAndPassword(key, password) {
  try {
    const keys = await readKeys();
    console.log('验证密钥:', key);
    console.log('存储的密钥信息:', keys);
    
    if (!keys[key]) {
      console.log('密钥不存在');
      return { exists: false };
    }
    
    if (!password) {
      // 读信模式,只需验证密钥存在即可
      console.log('读信模式，跳过密码验证');
      return { exists: true, valid: true };
    }
    
    // 写信模式,需要验证密码
    const hash = crypto.createHash('md5').update(password).digest('hex');
    console.log('密码验证:', {
      input: password,
      inputHash: hash,
      storedHash: keys[key].password,
      matches: hash === keys[key].password
    });
    
    const isValid = hash === keys[key].password;
    console.log('密码验证结果:', isValid);
    
    return {
      exists: true,
      valid: isValid
    };
  } catch (error) {
    console.error('验证密钥和密码时出错:', error);
    throw new Error('密码验证失败: ' + error.message);
  }
}

// 创建新密钥
export async function createNewKey(key, password) {
  try {
    console.log('\n创建新密钥 ========================');
    console.log('输入:', { key, password });
    
    const keys = await readKeys();
    console.log('当前存储的密钥:', keys);
    
    const hash = crypto.createHash('md5').update(password).digest('hex');
    console.log('生成的MD5哈希:', hash);
    
    keys[key] = {
      password: hash,
      createdAt: new Date().toISOString()
    };
    await saveKeys(keys);
    
    const savedKeys = await readKeys();
    console.log('保存后的密钥:', savedKeys);
    console.log('创建新密钥完成 ========================\n');
  } catch (error) {
    console.error('创建新密钥时出错:', error);
    throw new Error('创建新密钥失败: ' + error.message);
  }
}

// 读取指定密钥的所有信件
export async function readMessages(key) {
  try {
    const pattern = `${key}-*.md`;
    console.log('查找文件模式:', pattern);
    console.log('在目录:', MESSAGES_DIR);
    
    const files = await glob(pattern, {
      windowsPathsNoEscape: true,
      nodir: true,
      absolute: false,
      cwd: MESSAGES_DIR
    });
    
    console.log('找到的文件:', files);
    
    if (files.length === 0) {
      console.log('没有找到匹配的文件');
      return [];
    }

    const messages = await Promise.all(files.map(async (file) => {
      const fullPath = join(MESSAGES_DIR, file);
      console.log('读取文件:', fullPath);
      const content = await fs.readFile(fullPath, 'utf-8');
      const stats = await fs.stat(fullPath);
      return {
        content,
        createdAt: stats.birthtime.toISOString()
      };
    }));

    // 按时间倒序排序
    return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('读取信件时出错:', error);
    return [];
  }
}

// 保存信件
export async function saveMessage(key, content) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = join(MESSAGES_DIR, `${key}-${timestamp}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
  // 发送邮件通知
  await sendNotification(key, content);
}

// 确保必要目录存在
export async function ensureDirectories() {
  const dirs = [
    MESSAGES_DIR,
    dirname(KEYS_FILE)
  ];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
} 