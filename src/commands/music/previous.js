const { SlashCommandBuilder } = require('discord.js');
const { useHistory } = require('discord-player');
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Joue la musique précédente'),

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

    const history = useHistory(interaction.guild.id);
    if (!history) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");
    if (!history.previousTrack) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    await history.previous();
    client.replyEmbed(client, interaction, '', `☑️ | Musique précédente !`);

  },
};