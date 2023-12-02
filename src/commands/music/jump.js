const { SlashCommandBuilder } = require('discord.js');
const { useQueue } = require('discord-player');
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Passe directement a la musique choisi')
    .addIntegerOption((option) =>
      option
        .setName('nombre')
        .setDescription('Le numéro de la musique')
        .setRequired(true)),

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
    if (!queue.tracks || !queue.currentTrack) return client.replyEmbed(client, interaction, '', "ℹ️ | Il n'y a pas de queue !");

    const index = interaction.options.getInteger('nombre');
    if (index > queue.tracks.size || index < 1) return client.replyEmbed(
      client, interaction, '', `❌ | La position doit se situer entre \`1\` et \`${queue.tracks.size}\`!`);

    const Queue = queue.tracks.toArray()
    let track = Queue[index - 1];

    await queue.node.jump(index - 1);
    client.replyEmbed(client, interaction, '', `☑️ | Jump à la musique [${track.title}](${track.url})`);

  },
};