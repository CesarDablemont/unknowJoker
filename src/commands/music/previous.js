const { SlashCommandBuilder } = require('discord.js');
const { useHistory } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Joue la musique précédente'),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const history = useHistory(interaction.guild.id);
    if (!history) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");
    if (!history.previousTrack) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    await history.previous();
    client.replyEmbed(client, interaction, '', `☑️ | Musique précédente !`);

  },
};