// Для работы с Telegram Bot API устанавливаем пакет:
// npm install node-telegram-bot-api
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import TelegramBot from 'node-telegram-bot-api';

// Замените значения token и chatId на свои
const token = process.env.TELEGRAM_SIGNALFABRIC_BOT;
const chatId = '342611244';

// Создаём экземпляр бота без polling, так как будем только отправлять сообщения
const bot = new TelegramBot(token, { polling: false });

export function sendTelegramMessage(message) {
    return bot.sendMessage(chatId, message)
        .then(() => {
            //console.log('Сообщение успешно отправлено!');
        })
        .catch(err => {
            console.error('Ошибка при отправке сообщения:', err);
        });
}

export default sendTelegramMessage;
