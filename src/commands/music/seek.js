const { SlashCommandBuilder } = require('discord.js');
const { useQueue, usePlayer } = require('discord-player');
const ms = require("ms");
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Met la musique au moment choisis')
    .addStringOption((option) =>
      option
        .setName('temps')
        .setDescription('Le temps de la musique')
        .setRequired(true)),

  async execute(client, interaction) {

    const db = fs.readFileSync(dbPath);
    const data = JSON.parse(db);

    const guildId = interaction.guild.id;
    if (data[guildId].djMode == "DJ Only" && !interaction.member.roles.cache.some(r => r.id == data[guildId].djRole))
      return client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const queue = useQueue(interaction.guild.id);
    if (!queue) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    const temps = interaction.options.getString('temps');
    if (parseInt(ms(temps)) < 0) return client.replyEmbed(client, interaction, '', `❌ | Veuillez indiquer un temps valide!`);

    const player = usePlayer(interaction.guild.id);
    await player.seek(ms(temps));

    client.replyEmbed(client, interaction, '', `☑️ | set à \`${ms(ms(temps), { long: true })}\` ! `);

  },
};