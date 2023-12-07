const telegram = require('node-telegram-bot-api');
const data = require("./data");
const tasks = require("./schedule");

const hub_id = -1002044197247;
const sensei_id = "AgADgQEAAqxEnFE";
const token = '6730508123:AAFhzB6TKQkXdBb6wLKD7mo5fK19UyZa2MA';

const bot = new telegram(token, { polling: true });

const bot_commands =
[
    { command: 'list', description: 'List' },
    { command: 'commands', description: 'Commands' },
];

bot.setMyCommands(bot_commands);

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

const list = function(chat_id)
{
    const message = data.list();

    if (message === undefined || message.length === 0)
        return;

    send(chat_id, message);
}

const commands = function(chat_id)
{
    const message = data.commands();

    if (message === undefined || message.length === 0)
        return;

    send(chat_id, message);
}

const schedule = async function (chat_id, tokens)
{
    if (tokens.length !== 3)
        return;

    const data = tokens[1].split(' ');

    if (data.length !== 2)
        return;

    const date = data[0].split('.');

    if (date.length !== 2)
        return;

    const time = data[1].split(':');

    if (time.length < 2)
        return;

    const day = date[0];
    const month = date[1];
    const hours = time[0];
    const minutes = time[1];
    let zone = time[2] || 'UTC';

    if (zone !== 'UTC')
        zone = `Etc/${zone.replace('+', '-')}`;

    const message = tokens[2];

    const expression = `${minutes} ${hours} ${day} ${month} *`;

    tasks.schedule(expression, zone, () => send(hub_id, message));

    await bot.sendAnimation(chat_id, sensei_id);
}

bot.onText(/\/schedule/, (message) => {
    const chat_id = message.chat.id;

    const tokens = message.text.split(' | ');

    schedule(chat_id, tokens);
});

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
    list(chat_id);
});

bot.onText(/\/commands/, (message) => {
    const chat_id = message.chat.id;
    commands(chat_id);
});