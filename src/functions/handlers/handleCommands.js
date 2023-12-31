const { REST, Routes } = require('discord.js');
const { clientId, token } = require("../../../config.json");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {

    const commandFolders = fs.readdirSync("./src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`)
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(token);
    try {
      console.log('Started refreshing application (/) commands.');

      await rest.put(Routes.applicationCommands(clientId), { body: client.commandArray });

      console.log('Succesfully reloaded applications (/) commands.');
    } catch (error) {
      console.error(error);
    }

  };
};