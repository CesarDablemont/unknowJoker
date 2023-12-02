const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
  client.sendEmbed = async (client, interaction, title, description) => {

    try {
      let embed = new EmbedBuilder()
        .setColor(client.color)
        .setFooter({
          text: `Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        });

      if (title) embed.setTitle(title);
      if (description) embed.setDescription(description);
      return await interaction.channel.send({ embeds: [embed], ephemeral: true });

    } catch (err) {}

  };
};