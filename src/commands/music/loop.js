const { SlashCommandBuilder } = require('discord.js');
const { QueueRepeatMode, useQueue } = require('discord-player');

const repeatModes = [
  { name: 'Off', value: QueueRepeatMode.OFF },
  { name: 'Autoplay', value: QueueRepeatMode.AUTOPLAY },
  { name: 'Musique', value: QueueRepeatMode.TRACK },
  { name: 'Queue', value: QueueRepeatMode.QUEUE }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Change de mode de la queue (autoplay, loop musique, loop queue)')
    .addNumberOption((option) =>
      option
        .setName('mode')
        .setDescription('choisi un mode')
        .setRequired(true)
        .addChoices(...repeatModes)
    ),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only", "dj_mode");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const queue = useQueue(interaction.guild.id);
    if (!queue) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    const mode = interaction.options.getNumber('mode');
    const name = mode === QueueRepeatMode.OFF ? 'Looping' : repeatModes.find((m) => m.value === mode)?.name;
    await queue.setRepeatMode(mode);

    client.replyEmbed(client, interaction, '', `☑️ | **${name}** a était ${mode === queue.repeatMode ? 'activé' : 'désactivé'}`);

  },
};