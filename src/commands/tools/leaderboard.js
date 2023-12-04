const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/voiceTime.db');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement du temps de voc'),

  async execute(client, interaction) {

    db.all('SELECT * FROM voiceTime ORDER BY xp DESC', async (err, rows) => {
      if (err) throw err;

      let user = client.user.id;
      let membre = interaction.guild.members.cache.get(user);

      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle(`Top du Temps de voc (depuis le ${moment(membre.joinedAt).format('LL')})`)

      for (let i = 0; i < 10; i++) {
        if (i > rows.length - 1) {
          break;
        }

        var j = i;
        const user = await client.users.fetch(rows[i].userId).catch(() => null);
        embed.addFields({
          name: `${++j} | ${user.tag}`,
          value: `\`\`\`yaml\n${formatTime(rows[i].xp)}\n\`\`\``
        });
      }

      await interaction.reply({ embeds: [embed] });
    });

  },
};

function formatTime(s) {
  parseInt(s, 10);

  var heures = Math.floor(s / 3600);
  var minutes = Math.floor(s / 60) % 60;
  var secondes = Math.floor(s / 1) % 60;

  if (heures) return heures + " heures " + minutes + " minutes " + secondes + " secondes ";
  if (minutes) return minutes + " minutes " + secondes + " secondes ";
  if (secondes) return secondes + " secondes ";
  return "0 secondes";
};