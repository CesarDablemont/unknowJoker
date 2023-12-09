const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const { lyricsExtractor } = require('@discord-player/extractor');
const genius = lyricsExtractor();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription("Affiche les paroles d'une musique")
    .addStringOption((option) =>
      option
        .setName('titre')
        .setDescription('Le titre de la musique')),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    const queue = useQueue(interaction.guild.id);
    const track = interaction.options.getString('titre') || (queue?.currentTrack?.title);
    const lyrics = await genius.search(track).catch(() => null);

    if (!lyrics) return client.replyEmbed(client, interaction, '', `Il n'y avait **aucune** paroles trouvées`);
    const trimmedLyrics = lyrics.lyrics.substring(0, 4000);

    const embed = new EmbedBuilder()
      .setTitle(lyrics.title)
      .setURL(lyrics.url)
      .setThumbnail(lyrics.thumbnail)
      .setAuthor({
        name: lyrics.artist.name,
        iconURL: lyrics.artist.image,
        url: lyrics.artist.url
      })
      .setDescription(trimmedLyrics.length === 4000 ? `${trimmedLyrics}...` : trimmedLyrics)
      .setColor(client.color);

    interaction.reply({ embeds: [embed] });

  },
};