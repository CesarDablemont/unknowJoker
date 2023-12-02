const fs = require('fs');
const dbPath = "./data/music.json";
const db = fs.readFileSync(dbPath);
const data = JSON.parse(db);

module.exports = {
  name: "messageCreate",
  async execute(message, client) {

    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;
    if (!data[guildId]) {
      data[guildId] = {
        playMessage: "0",
        playChannel: "0",
        djRole: "0",
        djMode: "Off"
      };

      const pushData = JSON.stringify(data);
      await fs.writeFile(dbPath, pushData, function (err) {
        if (err) console.error(err);
      });
    };

  },
};