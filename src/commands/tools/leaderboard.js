//https://stackoverflow.com/questions/65207693/leaderboard-command-for-json-database
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const dbPath = "./data/voiceTime.json";
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement du temps de voc'),

  async execute(client, interaction) {

    var embed = await leaderboard(client, interaction);
    await interaction.reply({ embeds: [embed] });

    var startTime = new Date().getTime();
    var interval = setInterval(async function(){

        if(new Date().getTime() - startTime > 900000){
            clearInterval(interval);
            return;
        }
        var embed = await leaderboard(client, interaction);
        await interaction.editReply({ embeds: [embed] });
    }, 10000);  

    // setInterval(async () => {
    //   var embed = await leaderboard(client, interaction);
    //   await interaction.editReply({ embeds: [embed] });
    // }, 10000);

  },
};

async function leaderboard(client, interaction){

  const guildId = interaction.guild.id;

  const db = fs.readFileSync(dbPath);
  const data = JSON.parse(db);

  const xp = data[guildId];
  const sorted = [];
  const keys = Object.keys(xp)
  
  for (let user in xp) {
    const experience = xp[user].xp;
    
    const entry = {[keys[sorted.length]] : xp[user]}
    
    if (sorted.length === 0) {
      sorted.push(entry);
  
      continue;
    }
    let i = 0;
    while (sorted[i] !== undefined && sorted[i][Object.keys(sorted[i])].xp > experience) {
      i++;
    }
      
    sorted.splice(i, 0, entry)
  }

  let user = client.user.id;
  let membre = interaction.guild.members.cache.get(user);

  const embed = new EmbedBuilder()
  embed.setColor(client.color)
  embed.setTitle(`Top du Temps de voc (depuis le ${moment(membre.joinedAt).format('LL')})`)

  for(let i = 0; i < 9; i++){
    let j = i;
    
    try {

      userID = Object.keys(sorted[i]).toString();
      const user = await client.users.fetch(userID).catch(() => null);

      // console.log("userID", userID);
      // console.log("xp", data[guildId][userID].xp);
      
      embed.addFields({
        name: `${++j} | ${user.tag}`,
        value:  `\`\`\`yaml\n${formatTime(data[guildId][userID].xp)}\n\`\`\``
      });
      
    } catch (err) {};

    // const listed = sorted.toArray();
    // const list = listed.map((user) => `${j++} | ${user.tag}`).join("\n")
    // embed.setDescription(`\`\`\`yaml\n${list}\n\`\`\``)

  }

  return embed;
}

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