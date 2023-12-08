const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/servers.db');

module.exports = {
  name: "messageCreate",
  async execute(message, client) {

    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    db.run('CREATE TABLE IF NOT EXISTS servers (id INTEGER PRIMARY KEY, guildId VARCHAR(255), playChannel VARCHAR(255), playMessage VARCHAR(255), djRole VARCHAR(255), djMode TEXT)', function (err) {

      db.get(`SELECT * FROM servers WHERE guildId = ${guildId}`, (err, row) => {
        if (err) return console.error(err);
        if (row) return;

        db.run(`INSERT INTO servers (guildId, playChannel, playMessage, djRole, djMode) VALUES (${guildId}, "", "", "", "off")`, function (err) {
          if (err) return console.error(err);
        });
      });
    });

  },
};