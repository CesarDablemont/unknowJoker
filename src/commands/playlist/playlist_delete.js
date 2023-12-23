const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/playlist.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist_delete')
    .setDescription('Supprime une playlist')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('Le nom de la playlist')
        .setRequired(true)
        .setAutocomplete(true)),
  async autocomplete(client, interaction) {

    const userId = interaction.user.id;
    const query = await interaction.options.getString("playlist");
    const playlists = await searchPlaylists(userId, query);
    return interaction.respond(playlists);

  },
  async execute(client, interaction) {

    const userId = interaction.user.id;
    const playlistId = interaction.options.getString('playlist');

    const deletePlaylist = 'DELETE FROM playlists WHERE playlist_id = ? AND user_id = ?';
    db.run(deletePlaylist, [playlistId, userId], async (err, row) => {
      if (err) console.error(err);
      if (this.changes === 0) return client.replyEmbed(client, interaction, '',
        'ℹ️ | Aucune playlist trouvée ou vous n\'avez pas la permission de la supprimer.');

      const deltePlaylistSongs = `DROP TABLE songs_${playlistId}`
      db.run(deltePlaylistSongs, async (err, row) => {
        if (err) console.error(err);
        if (this.changes === 0) return client.replyEmbed(client, interaction, '',
          'ℹ️ | Une erreur s\'est produite lors de la suppression des chansons de la playlist.');

        return client.replyEmbed(client, interaction, '', `☑️ | La playlist a été supprimée.`);
      });
    });

  },
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