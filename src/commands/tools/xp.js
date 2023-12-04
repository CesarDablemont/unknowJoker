const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/voiceTime.db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('Affiche ton temps de voc')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Le membre dont tu veux voir le temps de vocal')),

  async execute(client, interaction) {

    const user = interaction.options.getUser('user') ? interaction.options.getUser('user') : interaction.user;
    if (user.bot) return client.replyEmbed(client, interaction, '', `Les bots n'ont pas d'xp`);

    const guildId = interaction.guild.id;
    const userId = user.id;

    db.get('SELECT xp FROM voiceTime WHERE guildId = ? AND userId = ?', [guildId, userId], (err, row) => {
      if (err) return console.error(err);

      if (!row) {
        db.run('INSERT INTO voiceTime (guildId, userId, xp) VALUES (?, ?, ?)', [guildId, userId, 0], function (err) {
          if (err) return console.error(err);
        });
      }

      const xp = row ? row.xp : 0;
      const embed = new EmbedBuilder()
        .setColor(client.color)
        .setTitle(`Temps de voc de ${user.tag}`)
        .setDescription(`\`\`\`yaml\n${formatTime(xp)}\n\`\`\``)

      interaction.reply({ embeds: [embed] });

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