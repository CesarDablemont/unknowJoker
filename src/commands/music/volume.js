const { SlashCommandBuilder } = require('discord.js');
const { useQueue, usePlayer } = require('discord-player');
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Change le volume du bot')
    .addIntegerOption((option) =>
      option
        .setName('volume')
        .setDescription('Le volume de la musique')
        .setMinValue(0)),

  async execute(client, interaction) {

    const db = fs.readFileSync(dbPath);
    const data = JSON.parse(db);

    const guildId = interaction.guild.id;
    if ((data[guildId].djMode == "DJ Mode" || data[guildId].djMode == "DJ Only")
      && !interaction.member.roles.cache.some(r => r.id == data[guildId].djRole))
      return client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const queue = useQueue(interaction.guild.id);
    if (!queue) return client.replyEmbed(client, interaction, '', "ℹ️ | Je ne joue rien actuellement !");

    const volumeJoin = interaction.options.getInteger('volume');
    const volume = Math.floor(parseInt(volumeJoin) - 20);

    const player = usePlayer(interaction.guild.id);
    if (!volumeJoin) return client.replyEmbed(client, interaction, '', `🔊 | Le volume est à: **${Math.floor(parseInt(player.volume) + 20)}**`);

    await player.setVolume(parseInt(volume));
    client.replyEmbed(client, interaction, '', `☑️ | Volume réglé sur ${volumeJoin}`);

  },
};