const { ActivityType } = require('discord.js');
const chalk = require('chalk');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/voiceTime.db');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    client.user.setPresence({
      activities: [{
        name: `/play`,
        type: ActivityType.Listening
      }],
      status: 'online',
    });

    console.log(chalk.green.bold(`Ready! ${client.user.tag} écoute de la musique!`));

    // Créez la table si elle n'existe pas
    db.run('CREATE TABLE IF NOT EXISTS voiceTime (id INTEGER PRIMARY KEY, guildId VARCHAR(255), userId VARCHAR(255), xp INTEGER)', function (err) {
      if (err) return console.error(err);

      deltaTime = 10;
      setInterval(async () => {

        deltaTime = getRandomInt(5) + 8;
        client.guilds.cache.forEach(async (guild) => {

          const guildId = guild.id;
          const members = await guild.members.fetch();
          members.forEach(async (member) => {

            if (member.user.bot) return;
            if (!member.voice.channel || member.voice.mute) return;
            const userId = member.id;

            // si le membre n'est pas dans la db
            db.get('SELECT * FROM voiceTime WHERE guildId = ? AND userId = ?', [guildId, userId], (err, row) => {
              if (err) return console.error(err);

              // if user exist update it
              if (row) {
                db.run('UPDATE voiceTime SET xp = ? WHERE id = ?', [row.xp + deltaTime, row.id], function (err) {
                  if (err) return console.error(err);
                });

                // else insert new user
              } else {
                db.run('INSERT INTO voiceTime (guildId, userId, xp) VALUES (?, ?, ?)', [guildId, userId, deltaTime], function (err) {
                  if (err) return console.error(err);
                });
              }
            });
          });

        });

        // // afficher la db
        // db.all('SELECT * FROM voiceTime', (err, rows) => {
        //   if (err) throw err;

        //   console.log('voiceTime:')
        //   rows.forEach((row) => {
        //     console.log(`ID: ${row.id}, guildId: ${row.guildId}, userId: ${row.userId}, xp: ${row.xp}`)
        //   })
        // });

      }, deltaTime * 1000);
    });

  },
};

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
