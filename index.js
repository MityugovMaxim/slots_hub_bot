const telegram = require('node-telegram-bot-api');
const data = require("./data");
const tasks = require("./schedule");

const hub_id = -1002044197247;
const sensei_id = "CgACAgIAAxkDAAIB3GVySDzpL7YFjsG7utnxk7drKzkKAAIBPAACkYaRS7-dkkYUOIWiMwQ";
const solder_id = "CgACAgIAAxkDAAIB4GVySOUWVdqCEc1u1rZryKM8JS9VAAICPAACkYaRSz1zMuvDTOHbMwQ";
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
    return bot.sendMessage(chat_id, message, { parse_mode: 'HTML' });
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

    return send(chat_id, message);
}

const commands = function(chat_id)
{
    const message = data.commands();

    if (message === undefined || message.length === 0)
        return;

    return send(chat_id, message);
}

const schedule = async function (chat_id, tokens)
{
    if (tokens.length < 3)
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

    let animation = tokens[3];

    switch (animation)
    {
        case "sensei":
            animation = sensei_id;
            break;
        case "solder":
            animation = solder_id;
            break;
    }

    const expression = `${minutes} ${hours} ${day} ${month} *`;

    tasks.schedule(expression, zone, async () =>
    {
        await send(hub_id, message);

        if (animation !== undefined)
            await bot.sendAnimation(hub_id, animation);
    });

    if (animation !== undefined)
        await bot.sendAnimation(chat_id, animation);
}

bot.onText(/\/schedule/, async (message) =>
{
    const chat_id = message.chat.id;

    const tokens = message.text.split(' | ');

    await schedule(chat_id, tokens);
});

bot.onText(/\/set/, async (message) =>
{
    const chat_id = message.chat.id;

    const tokens = message.text.split(' ');

    if (tokens.length !== 3) {
        await send(chat_id, `/set SLOT_NAME CONFIG_ID`);
        return;
    }

    set(chat_id, tokens);
});

bot.onText(/\/remove/, async (message) =>
{
    const chat_id = message.chat.id;

    const tokens = message.text.split(' ');

    if (tokens.length !== 2)
    {
        await send(chat_id, `/remove SLOT_NAME`);
        return;
    }

    remove(chat_id, tokens);
});

bot.onText(/\/list/, async (message) =>
{
    const chat_id = message.chat.id;
    await list(chat_id);
});

bot.onText(/\/commands/, async (message) =>
{
    const chat_id = message.chat.id;
    await commands(chat_id);
});

bot.onText(/\/message/, async (message) =>
{
    await send(message.chat.id, JSON.stringify(message));
    await bot.sendAnimation(message.chat.id, sensei_id);
});