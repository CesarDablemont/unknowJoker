const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = async (client) => {
  client.hasMusicPerm = async (interaction, mode, mode2) => {
    return new Promise((resolve, reject) => {
      try {
        const guildId = interaction.guild.id;
        db.get(`SELECT * FROM servers WHERE guildId = ${guildId}`, (err, row) => {
          if (err) {
            console.error(err);
            reject(err);
            return;
          }

          if (mode2) {
            if ((row.djMode == mode || row.djMode == mode2) && !interaction.member.roles.cache.some(r => r.id == row.djRole)) {
              client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");
              resolve(false);
            } else {
              resolve(true);
            }

          } else {

            if ((row.djMode == mode) && !interaction.member.roles.cache.some(r => r.id == row.djRole)) {
              console.log("has NOT mode2");
              client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");
              resolve(false);
            } else {
              resolve(true);
            }
          }
        });
      } catch (err) { }
    });
  };
};
