const { InteractionType } = require('discord.js');
const fs = require('fs');
const dbPath = "./data/music.json";
const db = fs.readFileSync(dbPath);
const data = JSON.parse(db);

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {

    const guildId = interaction.guild.id;
    if (!data[guildId]) {
      data[guildId] = {
        playMessage: "0",
        playChannel: "0",
        djRole: "0",
        djMode: "Off"
      };

      const pushData = JSON.stringify(data);
      await fs.writeFile(dbPath, pushData, function (err) {
        if (err) console.error(err);
      });
    };


    if (interaction.isChatInputCommand()) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: `Une erreur s'est produite lors de l'exécution de cette commande...`,
          ephemeral: true,
        });
      }

    }
    else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      try {
        await command.autocomplete(client, interaction);
      } catch (error) {
        console.error(error);
      }
    }
  },
};