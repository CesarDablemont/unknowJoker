const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Déconnect le bot du vocal'),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only", "dj_mode");
    if (!canPlay) return;
    
    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    await client.player.nodes.delete(interaction.guild.id);
    client.replyEmbed(client, interaction, '', `☑️ | Déconnecté !`);

    try {
      const connection = getVoiceConnection(interaction.member.voice.channel.id);
      connection.destroy();
    } catch (err) { };

  },
};