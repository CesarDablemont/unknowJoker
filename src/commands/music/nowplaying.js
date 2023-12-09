const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { emojis } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Affiche la musique actuel'),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;
    
    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const queue = useQueue(interaction.guild.id);
    if (!queue) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    const track = queue.currentTrack;
    const ts = queue.node.getTimestamp();

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle(`${emojis.disk} Now Playing`)
      .setThumbnail(track.thumbnail ?? interaction.user.displayAvatarURL())
      .addFields([
        { name: 'Titre', value: `[${track.title}](${track.url})`, inline: true },
        { name: 'Auteur', value: track.author, inline: true },
        { name: 'Progression', value: `${queue.node.createProgressBar({ indicator: emojis.croix, line: "▬" })} (${ts?.progress}%)` }
      ])

    return interaction.reply({ embeds: [embed] });

  },
};