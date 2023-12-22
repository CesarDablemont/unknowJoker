const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/playlist.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist_show')
    .setDescription('Affiche la liste des musique d\'une playlist')
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

    const playlistId = interaction.options.getString('playlist');
    db.get(`SELECT * FROM playlists WHERE playlist_id = ?`, [playlistId], async (err, row) => {
      if (err) console.error(err);
      if (!row) return client.replyEmbed(client, interaction, '', 'ℹ️ | Aucune playlist trouvée.');

      const user = client.users.cache.get(row.user_id);
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

      const songsList = songs
        .map((song) => `${song.song_id}- [${song.song_name}](${song.song_url})`)
        .join('\n');
      console.log(songsList);

      if (!songsList)
        return client.replyEmbed(client, interaction, `Playlist ${row.name} de ${user.username}`, "La playlist est vide.");

      return client.replyEmbed(client, interaction, `Playlist ${row.name} de ${user.username}`, songsList);
    });





    // const getPlaylistsQuery = `SELECT * FROM playlists`;

    // db.all(getPlaylistsQuery, async (err, playlists) => {
    //   if (err) console.error(err);

    //   if (playlists.length === 0) {
    //     return client.replyEmbed(client, interaction, '', 'ℹ️ | Aucune playlist trouvée.');
    //   }

    //   const playlistsMap = [];

    //   for (const playlist of playlists) {
    //     const getSongsQuery = `SELECT * FROM songs_${playlist.playlist_id}`;

    //     const songs = await new Promise((resolve) => {
    //       db.all(getSongsQuery, (err, songs) => {
    //         if (err) {
    //           console.error(err);
    //           resolve([]);
    //         } else {
    //           resolve(songs);
    //         }
    //       });
    //     });

    //     const songsList = songs
    //       .map((song) => `Chanson ID: ${song.song_id}\nNom de la chanson: ${song.song_name}\nURL de la chanson: ${song.song_url}`)
    //       .join('\n\n');

    //     playlistsMap.push(`__**Playlist ID: ${playlist.playlist_id}**__\nUtilisateur ID: ${playlist.user_id}\nNom de la playlist: ${playlist.name}\n\nChansons:\n${songsList}`);
    //   }

    //   // console.log(playlistsMap);
    //   const database = playlistsMap.join('\n\n');

    //   client.replyEmbed(client, interaction, 'Liste des playlists et de leurs chansons', database);
    // });
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