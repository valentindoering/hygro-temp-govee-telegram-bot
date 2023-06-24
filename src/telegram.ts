import TelegramBot from 'node-telegram-bot-api'

export class TelegramClient {
    private bot: TelegramBot;

    private telegramBotKey: string;
    private telegramChatId: number;

    constructor(telegramChatId: number, telegramBotKey: string, isPolling: boolean = true) {
        this.telegramBotKey = telegramBotKey;
        this.telegramChatId = telegramChatId;

        this.bot = new TelegramBot(telegramBotKey, { polling: isPolling });
    }

    public async runPolling(onMessage: (text: string) => Promise<void>) {


        this.bot.on('message', async (msg: TelegramBot.Message) => {
            const chatId = msg.chat.id;
            if (chatId !== this.telegramChatId) {
                console.log("chatId !== telegramChatId");
                return;
            }

            let text = msg.text?.toString()
            if (text) {
                await onMessage(text);
            } else {
                console.log("format not supported")
            }

        });
    }

    public async sendText(text: string): Promise<TelegramBot.Message> {
        return this.bot.sendMessage(this.telegramChatId, text)
    }

    public async sendImage(imagePath: string): Promise<TelegramBot.Message> {
        return this.bot.sendPhoto(this.telegramChatId, imagePath)
    }
}



