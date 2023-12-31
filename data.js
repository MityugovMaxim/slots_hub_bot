const fs = require('fs');

const path = 'data.json';
const registry = new Map();

fs.readFile(path, 'utf-8', (error, data) => {
   const resource = JSON.parse(data);

    Object.keys(resource).forEach((key) =>
    {
        registry.set(key, resource[key]);
    });
});

const getItems = function()
{
    const items = Array.from(registry, ([key, value]) => ({ key, value }));

    items.sort((a, b) => a.key.localeCompare(b.key));

    return items;
}

const save = function()
{
    const resource = { };

    registry.forEach((value, key) =>
    {
        resource[key] = value;
    });

    const json = JSON.stringify(resource, null, 2);

    fs.writeFileSync(path, json);
}

exports.set = function(name, config)
{
    registry.set(name, config);

    save();
};

exports.remove = function(name)
{
    registry.delete(name);

    save();
}

exports.list = function()
{
    let message = "";
    for (const entry of getItems())
        message += `<strong>${entry.key}</strong>: <code>${entry.value}</code>\n`;
    return message;
}

exports.commands = function()
{
    let message = "";
    for (const entry of getItems())
        message += `<strong>${entry.key}</strong>: <code>/slot config set ${entry.key} ${entry.value}</code>\n`;
    return message;
}
