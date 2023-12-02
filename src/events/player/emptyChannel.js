const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "emptyChannel",
  async execute(client, queue, track) {

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription("Le vocal est vide! je quitte le vocal...")
    queue.metadata.channel.send({ embeds: [embed] });

  },
};