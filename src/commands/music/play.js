const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QueryType } = require('discord-player');
const fs = require('fs');
const dbPath = "./data/music.json";

// const { useMasterPlayer } = require("discord-player");
// const player = useMasterPlayer();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Joue une musique')
    .addStringOption((option) =>
      option
        .setName('musique')
        .setDescription('La musique a jouer')
        .setRequired(true)
        .setAutocomplete(true)),

  async autocomplete(client, interaction) {

    var query = interaction.options.getString('musique');

    const results = await client.player.search(query, {
    // const results = await player.search(query, {
      searchEngine: QueryType.YOUTUBE_SEARCH
    });

    return await interaction.respond(
      results.tracks.slice(0, 10).map((t) => ({
        name: t.title,
        value: t.url
      }))
    );

  },
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

    const musique = interaction.options.getString('musique');
    await interaction.deferReply();

    const res = await client.player.play(interaction.member.voice.channel, musique, {
    // const res = await player.play(interaction.member.voice.channel, musique, {
      nodeOptions: {
        metadata: {
          channel: interaction.channel,
          client: interaction.guild.members.me,
          requestedBy: interaction.user,
        },
        volume: 30,
      }
    });

    const replyEmbed = new EmbedBuilder()
      .setColor(client.color)
      .setDescription(res.track.playlist ? `Plusieur musiques de: **[${res.track.playlist.title}](${res.track.playlist.url})** ont été ajouté à la file d'attente.` : `[${res.track.title}](${res.track.url}) a été ajouté à la file d'attente.`)
    interaction.editReply({ embeds: [replyEmbed] });
    
  },
};