const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dj')
    .setDescription('Tout ce dont tu as besoin pour le DJ mode')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand =>
      subcommand
        .setName('role')
        .setDescription('Le role DJ que tu veux ajouté')
        .addRoleOption(option => option.setName('role').setDescription('Le role DJ').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('mode')
        .setDescription('Le mode DJ que tu veux mettre')
        .addStringOption(option =>
          option.setName('mode')
            .setDescription('Le mode')
            .setRequired(true)
            .addChoices(
              { name: 'Off', value: 'off' },
              { name: 'DJ Mode', value: 'dj_ode' },
              { name: 'DJ Only', value: 'dj_only' },
            ))),

  async execute(client, interaction) {


    const guildId = interaction.guild.id;
    db.get(`SELECT * FROM servers WHERE guildId = ${guildId}`, (err, row) => {
      if (err) return console.error(err);

      if (interaction.options.getSubcommand() === 'role') {
        const role = interaction.options.getRole('role');

        client.replyEmbed(client, interaction,
          `Le role DJ a changé`,
          `Le nouveau role est: ${role}`
        );

        db.run(`UPDATE servers SET djRole = ${role.id}, WHERE id = ${row.id}`, function (err) {
          if (err) return console.error(err);
        });

      } else if (interaction.options.getSubcommand() === 'mode') {
        const mode = interaction.options.getString('mode');

        client.replyEmbed(client, interaction,
          `Le mode DJ a changé`,
          `Le nouveau mode est: **${mode}**`
        );

        db.run(`UPDATE servers SET djMode = ${mode}, WHERE id = ${row.id}`, function (err) {
          if (err) return console.error(err);
        });
      }
    });

  },
};