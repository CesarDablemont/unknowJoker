const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/playlist.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist_create')
    .setDescription('Crée une playlist')
    .addStringOption((option) =>
      option
        .setName('nom')
        .setDescription('Le nom de la playlist')
        .setRequired(true)),
  async execute(client, interaction) {

    const createPlaylistTable = `
      CREATE TABLE IF NOT EXISTS playlists (
        playlist_id INTEGER PRIMARY KEY,
        user_id VARCHAR(255),
        name TEXT,
        UNIQUE (user_id, name)
      )
    `;

    db.run(createPlaylistTable, (err) => {
      if (err) console.error(err);

      const userId = interaction.user.id;
      const playlistName = interaction.options.getString('nom');
      db.get('SELECT * FROM playlists WHERE user_id = ? AND name = ?', [userId, playlistName], (err, row) => {
        if (err) console.error(err);

        if (!row) {
          db.run('INSERT INTO playlists (user_id, name) VALUES (?, ?)', [userId, playlistName], function (err) {
            if (err) return console.error(err);

            const playlistId = this.lastID;

            const createSongsTable = `
              CREATE TABLE IF NOT EXISTS songs_${playlistId} (
                song_id INTEGER PRIMARY KEY,
                song_name TEXT,
                song_url TEXT,
                UNIQUE (song_name, song_url)
              )
            `;

            db.run(createSongsTable, (err) => {
              if (err) {
                console.error(err);
                return client.replyEmbed(client, interaction, '',
                  '❌ | Une erreur est survenue lors de la création de la table des chansons.');
              }
            });
          });
          return client.replyEmbed(client, interaction, '', `☑️ | La playlist **${playlistName}** a été créée.`);

        } else {
          return client.replyEmbed(client, interaction, '', `❌ | Tu as déjà une playlist nommée **${playlistName}**.`);
        }
      });
    });
  },
};
