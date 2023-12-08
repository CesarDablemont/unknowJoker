const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop la musique'),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    await client.player.nodes.delete(interaction.guild.id);
    client.replyEmbed(client, interaction, '', `☑️ | Stoppé !`);

  },
};