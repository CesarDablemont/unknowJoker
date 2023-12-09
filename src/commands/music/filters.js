const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filters')
    .setDescription('Active/désactive les filter de musique')
    .addStringOption((option) =>
      option
        .setName('filter')
        .setDescription('Le filter à appliquer')
        .addChoices(
          { name: 'Off', value: 'Off' },
          { name: 'lofi', value: 'lofi' },
          { name: '8D', value: '8D' },
          { name: 'bassboost', value: 'bassboost' },
          { name: 'compressor', value: 'compressor' },
          { name: 'karaoke', value: 'karaoke' },
          { name: 'vibrato', value: 'vibrato' },
          { name: 'vaporwave', value: 'vaporwave' },
          { name: 'nightcore', value: 'nightcore' },
          { name: 'tremolo', value: 'tremolo' }
        )
        .setRequired(true)),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only", "dj_mode");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const queue = useQueue(interaction.guild.id);
    if (!queue) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    const filter = interaction.options.getString('filter') ? interaction.options.getString('filter') : "Off";

    if (filter === 'Off') {
      await queue.filters.ffmpeg.setFilters(false);
      return client.replyEmbed(client, interaction, '', `☑️ | Le **filtre** a été **désactivé**`);
    }

    await queue.filters.ffmpeg.toggle(filter.includes('bassboost') ? ['bassboost', 'normalizer'] : filter);
    client.replyEmbed(client, interaction, '', `☑️ | **${filter}** filter has been **${queue.filters.ffmpeg.isEnabled(filter) ? 'enabled' : 'disabled'}**`);

  },
};