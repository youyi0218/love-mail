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
    console.log('开始创建新密钥:', { key, password });
    let keys = {};

    // 读取现有密钥
    try {
      const data = await fs.readFile(KEYS_FILE, 'utf8');
      keys = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // 检查密钥是否已存在
    if (keys[key]) {
      throw new Error('密钥已存在');
    }

    // 保存密钥信息（密码使用MD5加密，密钥使用明文）
    keys[key] = {
      password: crypto.createHash('md5').update(password).digest('hex'),
      createdAt: new Date().toISOString()
    };

    // 保存到文件
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));
    console.log('密钥创建成功');
  } catch (error) {
    console.error('创建密钥失败:', error);
    throw error;
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
        id: file.replace(`${key}-`, '').replace('.md', ''),
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
export async function saveMessage(key, content, messageId, createdAt) {
  try {
    // 如果是更新现有信件
    if (messageId) {
      const files = await glob('*.md', {
        windowsPathsNoEscape: true,
        nodir: true,
        cwd: MESSAGES_DIR
      });
      
      // 查找匹配的文件
      const targetFile = files.find(file => file.startsWith(key) && file.includes(messageId));
      if (targetFile) {
        const filePath = join(MESSAGES_DIR, targetFile);
        await fs.writeFile(filePath, content, 'utf-8');
        return;
      }
    }
    
    // 如果是新信件或未找到要更新的信件
    const timestamp = createdAt ? new Date(createdAt).toISOString().replace(/[:.]/g, '-') : 
                                new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = join(MESSAGES_DIR, `${key}-${timestamp}.md`);
    await fs.writeFile(filePath, content, 'utf-8');
    // 发送邮件通知
    await sendNotification(key, content);
  } catch (error) {
    console.error('保存信件失败:', error);
    throw new Error('保存信件失败: ' + error.message);
  }
}

// 删除信件
export async function deleteMessage(key, messageId) {
  try {
    const files = await glob('*.md', {
      windowsPathsNoEscape: true,
      nodir: true,
      cwd: MESSAGES_DIR
    });
    
    // 查找匹配的文件
    const targetFile = files.find(file => file.startsWith(key) && file.includes(messageId));
    if (!targetFile) {
      throw new Error('未找到要删除的信件');
    }
    
    const filePath = join(MESSAGES_DIR, targetFile);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('删除信件失败:', error);
    throw new Error('删除信件失败: ' + error.message);
  }
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