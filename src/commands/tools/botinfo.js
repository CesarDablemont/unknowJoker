const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const packageJSON = require("../../../package.json");
const os = require('os');
const cpuStat = require('cpu-stat');
const moment = require('moment');
moment.locale("fr");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Affiche toutes les infos du bot'),
  async execute(client, interaction) {

    cpuStat.usagePercent(function (error, percent) {
      if (error) return interaction.reply(error);
      const CPU = percent.toFixed(2); // CPU Usage

      const memoryusage = formatBytes(process.memoryUsage().heapUsed); // Memory Usage
      const discordJSVersion = packageJSON.dependencies["discord.js"]; // DiscordJS Version
      const node = process.version; // NodeJS Version
      const CPUModel = os.cpus()[0].model; // PC Model

      const embed = new EmbedBuilder()
        .setTitle("**Information du Bot**")
        .setColor(client.color)
        .setDescription(`
\`\`\`yaml
Nom:        ${client.user.username}
ID:         ${client.user.id}
Status:     ${client.presence.status}
Créé le:    ${moment(client.user.createdAt).format('LL')}
Servers:    ${client.guilds.cache.size}
Membres:    ${client.users.cache.size}
\`\`\``)

        .addFields({
          name: '**Hébergeur**',
          value: `
\`\`\`yaml
Serveur UpTime:   ${formatTime(Math.floor(os.uptime() * 1000))}
Bot UpTime:       ${formatTime(client.uptime)}
Node -v:          ${node}
Discord.js -v:    ${discordJSVersion}
CPU Model:        ${CPUModel}
Memery Usage:     ${memoryusage}
CPU Usage:        ${CPU}%
Cores:            ${os.cpus().length}
\`\`\``,
        })

      interaction.reply({ embeds: [embed] });

    });
  },
};

// For Memory In MB, GB....
function formatBytes(a, b) {
  let c = 1024 // 1 GB = 1024 MB
  d = b || 2
  e = ['B', 'KB', 'MB', 'GB', 'TB']
  f = Math.floor(Math.log(a) / Math.log(c))

  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + '' + e[f]
};

function formatTime(ms) {
  
  parseInt(ms, 10);

  var jours = Math.floor(ms / 86400000);
  var heures = Math.floor(ms / 3600000) % 24;
  var minutes = Math.floor(ms / 60000) % 60;
  var secondes = Math.floor(ms / 1000) % 60;

  if (jours) return jours + " jours " + heures + " heures " + minutes + " minutes " + secondes + " secondes ";
  if (heures) return heures + " heures " + minutes + " minutes " + secondes + " secondes ";
  if (minutes) return minutes + " minutes " + secondes + " secondes ";
  if (secondes) return secondes + " secondes ";
  return "0 secondes"
};