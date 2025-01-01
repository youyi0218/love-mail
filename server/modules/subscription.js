import fs from 'fs/promises';
import { join } from 'path';
import nodemailer from 'nodemailer';
import { readAdminConfig } from './admin.js';

const SUBSCRIBERS_FILE = join(process.cwd(), 'server', 'data', 'subscribers.json');
const EMAIL_QUEUE_FILE = join(process.cwd(), 'server', 'data', 'email_queue.json');
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000; // 5秒

// 读取订阅者列表
export async function readSubscribers() {
  try {
    const content = await fs.readFile(SUBSCRIBERS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// 保存订阅者列表
export async function saveSubscribers(subscribers) {
  await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));
}

// 读取邮件队列
async function readEmailQueue() {
  try {
    const content = await fs.readFile(EMAIL_QUEUE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

// 保存邮件队列
async function saveEmailQueue(queue) {
  await fs.writeFile(EMAIL_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

// 添加邮件到队列
async function addToEmailQueue(email, subject, html, key) {
  const queue = await readEmailQueue();
  queue.push({
    email,
    subject,
    html,
    key,
    retryCount: 0,
    createdAt: new Date().toISOString()
  });
  await saveEmailQueue(queue);
}

// 处理邮件队列
async function processEmailQueue() {
  const queue = await readEmailQueue();
  if (queue.length === 0) return;

  const config = await readAdminConfig();
  if (!config.smtp) {
    console.error('SMTP配置未找到');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    }
  });

  const newQueue = [];
  
  for (const item of queue) {
    try {
      await transporter.sendMail({
        from: config.smtp.from,
        to: item.email,
        subject: item.subject,
        html: item.html
      });
      console.log('邮件发送成功:', item.email);
    } catch (error) {
      console.error('发送邮件失败:', error);
      if (item.retryCount < MAX_RETRY_COUNT) {
        item.retryCount++;
        newQueue.push(item);
      } else {
        console.error('邮件发送失败次数过多，放弃发送:', item);
      }
    }
  }

  await saveEmailQueue(newQueue);
}

// 启动邮件队列处理
let queueProcessing = false;
async function startEmailQueueProcessor() {
  if (queueProcessing) return;
  queueProcessing = true;

  while (true) {
    try {
      await processEmailQueue();
    } catch (error) {
      console.error('处理邮件队列时出错:', error);
    }
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
}

// 发送通知
export async function sendNotification(key, content) {
  try {
    const subscribers = await readSubscribers();
    const emails = subscribers[key] || [];
    if (emails.length === 0) return;

    const config = await readAdminConfig();
    if (!config.emailTemplate) return;

    const { subject, template } = config.emailTemplate;
    const url = `https://love.theyouyi.site`;
    
    for (const email of emails) {
      const html = template.replace('{{url}}', url);
      await addToEmailQueue(email, subject, html, key);
    }

    // 确保队列处理器在运行
    startEmailQueueProcessor().catch(console.error);
  } catch (error) {
    console.error('准备发送通知时出错:', error);
  }
}

// 确保订阅者文件存在
export async function ensureSubscribersFile() {
  try {
    await fs.access(SUBSCRIBERS_FILE);
  } catch {
    await saveSubscribers({});
  }
  
  try {
    await fs.access(EMAIL_QUEUE_FILE);
  } catch {
    await saveEmailQueue([]);
  }
} 