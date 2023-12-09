const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ownerId } = require("../../../config.json");
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('display-db')
    .setDescription('Affiche la db')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {

    if (interaction.user.id != ownerId) return interaction.reply({
      content: "Touche pas a ça toi", ephemeral: true
    });

    await interaction.deferReply();
    await interaction.deleteReply();

    db.all('SELECT * FROM servers', (err, rows) => {
      if (err) throw err;
      console.log(rows);
    });

  },
};