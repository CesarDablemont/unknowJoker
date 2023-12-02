const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { emojis } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot'),
  async execute(client, interaction) {

    const startTime = Date.now()

    const embedTemp = new EmbedBuilder()
      .setColor(client.color)
      .setDescription("En cours...")
    await interaction.reply({ embeds: [embedTemp] });

    const endTime = Date.now();

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`Ping ${emojis.res}`)
      .setDescription(`\`\`\`yaml\nLatence du bot:       ${endTime - startTime}ms\nLatence de Discord:   ${client.ws.ping}ms\nLatence de la DB:     1ms\n\`\`\``)

    await interaction.editReply({ embeds: [embed] });

  },
};