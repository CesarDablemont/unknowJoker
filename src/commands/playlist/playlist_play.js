const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YouTubeExtractor } = require('@discord-player/extractor');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/playlist.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist_play')
    .setDescription('Joue une playlist des membres du serveur')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('Le nom de la playlist')
        .setRequired(true)
        .setAutocomplete(true)),
  async autocomplete(client, interaction) {

    const query = await interaction.options.getString("playlist");
    const playlists = await searchPlaylists(query);
    return interaction.respond(playlists);

  },
  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    userChannel = interaction.member.voice.channel;
    if (!userChannel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== userChannel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const permissions = userChannel.permissionsFor(client.user);
    if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak))
      return client.replyEmbed(client, interaction, '', "❌ | J'ai besoin des perms pour rejoindre et parler sur le channel!");

    const playlistId = interaction.options.getString('playlist');
    db.get(`SELECT * FROM playlists WHERE playlist_id = ?`, [playlistId], async (err, row) => {
      if (err) console.error(err);
      if (!row) return client.replyEmbed(client, interaction, '', 'ℹ️ | Aucune playlist trouvée.');

      const player = useMainPlayer();
      player.extractors.register(YouTubeExtractor);
      await interaction.deferReply();

      const getSongsQuery = `SELECT * FROM songs_${playlistId}`;
      const songs = await new Promise((resolve) => {
        db.all(getSongsQuery, (err, songs) => {
          if (err) {
            console.error(err);
            resolve([]);
          } else {
            resolve(songs);
          }
        });
      });

      await songs.forEach((song) => {
        player.play(interaction.member.voice.channel, song.song_url, {
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
              client: interaction.guild.members.me,
              requestedBy: interaction.user,
            },
            volume: 30,
          }
        });
      });

      const replyEmbed = new EmbedBuilder()
        .setColor(client.color)
        .setDescription("La playlist a été ajouté à la file d'attente.")
      interaction.editReply({ embeds: [replyEmbed] });
    });

  },
};

function searchPlaylists(query) {
  return new Promise((resolve, reject) => {
    const searchQuery = `
      SELECT * FROM playlists
      WHERE name LIKE ?
    `;

    db.all(searchQuery, [`%${query}%`], (err, rows) => {
      if (err) {
        console.error(err);
        reject([]);
      } else {
        const playlists = rows.map((row) => ({
          name: row.name,
          value: row.playlist_id.toString(),
        }));
        resolve(playlists);
      }
    });
  });
}