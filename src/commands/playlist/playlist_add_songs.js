const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YouTubeExtractor } = require('@discord-player/extractor');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/playlist.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist_add_songs')
    .setDescription('Ajoute une musique à une playlist')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('Le nom de la playlist')
        .setRequired(true)
        .setAutocomplete(true))
    .addStringOption((option) =>
      option
        .setName('musique')
        .setDescription('La musique à jouer')
        .setRequired(true)
        .setAutocomplete(true)),
  async autocomplete(client, interaction) {

    const focusedOption = interaction.options.getFocused(true);
    const query = await interaction.options.getString(focusedOption.name);

    if (focusedOption.name === 'playlist') {

      const userId = interaction.user.id;
      const playlists = await searchPlaylists(userId, query);
      return interaction.respond(playlists);

    } else if (focusedOption.name === 'musique') {
      const player = useMainPlayer();
      player.extractors.register(YouTubeExtractor);

      if (query.length < 3) {
        return interaction.respond([]);
      }

      const results = await player.search(query);
      const tracks = results.tracks.slice(0, 10).map((t) => ({
        name: t.title,
        value: t.url,
      }));

      return interaction.respond(tracks);
    }
  },
  async execute(client, interaction) {

    const userId = interaction.user.id;
    const playlistId = interaction.options.getString('playlist');
    const songUrl = interaction.options.getString('musique');
    const songName = await getSongNameByUrl(songUrl)

    db.get(`SELECT * FROM playlists WHERE user_id = ? AND playlist_id = ?`, [userId, playlistId], (err, row) => {
      if (err) { console.error(err); }
      if (!row) return client.replyEmbed(client, interaction, '', `❌ | Tu n'as pas de playliste nommée ainsi.`);

      const playlistId = row.playlist_id;
      const playlistName = row.name;
      const addSongToPlaylist = `
      INSERT INTO songs_${playlistId} (song_name, song_url)
      VALUES (?, ?)
      `;

      db.run(addSongToPlaylist, [songName, songUrl], function (err) {
        if (err) {
          console.error(err);
          if (err.message.includes('SQLITE_CONSTRAINT: UNIQUE'))
            return client.replyEmbed(client, interaction, '', '❌ | Cette musique est déjà dans ta playlist');
          else return client.replyEmbed(client, interaction, '', '❌ | Une erreur est survenue lors de l\'ajout de la chanson à la playlist.');
        }

        return client.replyEmbed(client, interaction, '', `☑️ | La chanson **[${songName}](${songUrl})** a été ajoutée à la playlist **${playlistName}**.`);
      });
    });
  }

};

function searchPlaylists(userId, query) {
  return new Promise((resolve, reject) => {
    const searchQuery = `
      SELECT * FROM playlists
      WHERE user_id = ? AND name LIKE ?
    `;

    db.all(searchQuery, [userId, `%${query}%`], (err, rows) => {
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

async function getSongNameByUrl(url) {
  const player = useMainPlayer();
  try {
    const searchResult = await player.search(url);
    return searchResult.tracks[0].title;
  } catch (error) {
    console.error('Error searching for track:', error.message);
  }
}
