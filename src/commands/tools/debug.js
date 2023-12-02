const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('debug')
    .setDescription(`Debug le bot pour la premiere utilisation`)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {

    const db = fs.readFileSync(dbPath);
    const data = JSON.parse(db);

    const guildId = interaction.guild.id;

    await interaction.deferReply();
    await interaction.deleteReply();
    const msg = await interaction.channel.send("Debuged !");

    data[guildId].playMessage = msg.id;
    data[guildId].playChannel = interaction.channel.id;

    const pushData = JSON.stringify(data);
    await fs.writeFile(dbPath, pushData, function (err) {
      if (err) console.error(err);
    });

  },
};
