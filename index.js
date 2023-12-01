const telegram = require('node-telegram-bot-api');
const data = require("./data");

const token = '6730508123:AAFhzB6TKQkXdBb6wLKD7mo5fK19UyZa2MA';

const bot = new telegram(token, { polling: true });

const commands = [
    { command: 'list', description: 'List' },
];

bot.setMyCommands(commands);

const send = function(chat_id, message)
{
    bot.sendMessage(chat_id, message, { parse_mode: 'HTML' });
}

const set = function(chat_id, tokens)
{
    const name = tokens[1];
    const config = tokens[2];

    data.set(name, config);
}

const remove = function(chat_id, tokens)
{
    const name = tokens[1];

    data.remove(name);
}

const list = function(chat_id, tokens)
{
    const message = data.list();

    if (message === undefined || message.length === 0)
        return;

    send(chat_id, message);
}

bot.onText(/\/set/, (message) => {
    const chat_id = message.chat.id;

    const tokens = message.text.split(' ');

    if (tokens.length !== 3)
    {
        send(chat_id, `/set SLOT_NAME CONFIG_ID`);
        return;
    }

    set(chat_id, tokens);
});

bot.onText(/\/remove/, (message) => {
    const chat_id = message.chat.id;

    const tokens = message.text.split(' ');

    if (tokens.length !== 2)
    {
        send(chat_id, `/remove SLOT_NAME`);
        return;
    }

    remove(chat_id, tokens);
});

bot.onText(/\/list/, (message) => {
    const chat_id = message.chat.id;

    const tokens = message.text.split(' ');

    list(chat_id, tokens);
});