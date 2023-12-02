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
    db.run('CREATE TABLE IF NOT EXISTS voiceTime (guildId TEXT, userId TEXT, xp INTEGER)');

    deltaTime = 10;
    setInterval(async () => {

      console.log("new xp add loop");
      deltaTime = getRandomInt(5) + 8;

      client.guilds.cache.forEach(async (guild) => {
        const guildId = guild.id;

        try {
          const members = await guild.members.fetch();
          members.forEach(async (member) => {
            if (member.user.bot) return;
            if (!member.voice.channel || member.voice.mute) return;

            const userId = member.id;

            // Récupérer l'xp de l'utilisateur depuis la base de données
            const xp = await getUserXp(guildId, userId);

            // Mettez à jour l'xp
            const updatedXp = xp + deltaTime;

            // voir ce qu'il se passe
            console.log(`userID:${userId}, xp:${xp}, new xp:${updatedXp}`);

            // Ajoutez ou mettez à jour la base de données
            const stmt = db.prepare('INSERT OR REPLACE INTO voiceTime (guildId, userId, xp) VALUES (?, ?, ?)');
            stmt.run(guildId, userId, updatedXp);
            stmt.finalize();

            // verification de l'enregistrement de l'xp
            let xpVerif = await getUserXp(guildId, userId);
            console.log(`user xp: ${xpVerif}`);
          });

        } catch (error) {
          console.error(`Error fetching members: ${error.message}`);
        }
      });

    }, deltaTime * 1000);

  },
};


async function getUserXp(guildId, userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT xp FROM voiceTime WHERE guildId = ? AND userId = ?', [guildId, userId], (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        const xp = row ? row.xp : 0;
        resolve(xp);
      }
    });
  });
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
