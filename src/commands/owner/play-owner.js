const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { QueryType, useQueue } = require('discord-player');
const { ownerId } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play-owner')
    .setDescription('Joue une musique')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName('musique')
        .setDescription('La musique a jouer')
        .setRequired(true)
        .setAutocomplete(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Le voc pour la musique')
        .setRequired(true)),

  async autocomplete(client, interaction) {

    var query = interaction.options.getString('musique');

    const results = await client.player.search(query, {
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

    if (interaction.user.id != ownerId) return interaction.reply({
      content: "Touche pas a ça toi", ephemeral: true
    });

    var musiqueChannel = interaction.options.getChannel('channel');

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const musique = interaction.options.getString('musique');
    const queue = useQueue(interaction.guild.id);

    if (queue) {

      const searchResult = await client.player.search(musique, { requestedBy: interaction.user });
      await queue.insertTrack(searchResult.tracks[0], 0);
      const res = searchResult.tracks[0];

      return client.replyEmbed(client, interaction, '', res.playlist ? ` Plusieur musiques de: **[${res.playlist.title}](${res.playlist.url})** ont été ajouté à la file d'attente.` : `[${res.title}](${res.url}) a été ajouté à la file d'attente.`);

    }

    await interaction.deferReply();

    const res = await client.player.play(musiqueChannel, musique, {
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