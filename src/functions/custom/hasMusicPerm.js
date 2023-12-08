const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = async (client) => {
  client.hasMusicPerm = async (interaction, mode) => {
    return new Promise((resolve, reject) => {
      try {
        const guildId = interaction.guild.id;
        db.get(`SELECT * FROM servers WHERE guildId = ${guildId}`, (err, row) => {
          if (err) {
            console.error(err);
            reject(err);
          }

          if ((row.djMode == mode) && !interaction.member.roles.cache.some(r => r.id == row.djRole)) {
            client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");
            console.log("hasMusicPerm = False");
            resolve(false);
          } else {
            console.log("hasMusicPerm = True");
            resolve(true);
          }
        });
      } catch (err) { }
    });
  };
};
