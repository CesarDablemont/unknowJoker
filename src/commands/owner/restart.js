const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ownerId } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription("Redémarre le bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {

    if (interaction.user.id != ownerId) return interaction.reply({
      content: "Touche pas a ça toi", ephemeral: true
    });

    await interaction.reply({
      content: "Le bot redémarre !", ephemeral: true
    });

    process.exit();

  },
};