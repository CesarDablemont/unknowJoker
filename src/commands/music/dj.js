const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const dbPath = "./data/music.json";

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
              { name: 'Off', value: 'Off' },
              { name: 'DJ Mode', value: 'DJ Mode' },
              { name: 'DJ Only', value: 'DJ Only' },
            ))),

  async execute(client, interaction) {

    const db = fs.readFileSync(dbPath);
    const data = JSON.parse(db);

    const guildId = interaction.guild.id;

    if (interaction.options.getSubcommand() === 'role') {
      const role = interaction.options.getRole('role');

      client.replyEmbed(client, interaction,
        `Le role DJ a changé`,
        `Le nouveau role est: ${role}`
      );

      data[guildId].djRole = role.id;

    } else if (interaction.options.getSubcommand() === 'mode') {
      const mode = interaction.options.getString('mode');

      client.replyEmbed(client, interaction,
        `Le mode DJ a changé`,
        `Le nouveau mode est: **${mode}**`
      );

      data[guildId].djMode = mode;
    }

    const pushData = JSON.stringify(data);
    await fs.writeFile(dbPath, pushData, function (err) {
      if (err) console.error(err);
    });

  },
};