const { InteractionType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {

    const guildId = interaction.guild.id;
    db.run('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, guildId VARCHAR(255), playChannel VARCHAR(255), playMessage VARCHAR(255), djRole VARCHAR(255), djMode TEXT)', function (err) {

      db.get(`SELECT * FROM servers WHERE guildId = ${guildId}`, (err, row) => {
        if (err) return console.error(err);
        if (row) return;

        db.run(`INSERT INTO servers (guildId, playChannel, playMessage, djRole, djMode) VALUES (${guildId}, "", "", "", "off")`, function (err) {
          if (err) return console.error(err);
        });
      });
    });

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