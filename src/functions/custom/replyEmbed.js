const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
  client.replyEmbed = async (client, interaction, title, description) => {

    try {
      let embed = new EmbedBuilder()
        .setColor(client.color)

      if (title) embed.setTitle(title);
      if (description) embed.setDescription(description);
      return await interaction.reply({ embeds: [embed] });

    } catch (err) {}

  };
};