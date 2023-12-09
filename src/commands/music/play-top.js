const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer, useQueue } = require('discord-player');
const { YouTubeExtractor } = require('@discord-player/extractor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play-top')
    .setDescription('Joue une musique')
    .addStringOption((option) =>
      option
        .setName('musique')
        .setDescription('La musique a jouer')
        .setRequired(true)
        .setAutocomplete(true)),

  async autocomplete(client, interaction) {

    const player = useMainPlayer();
    player.extractors.register(YouTubeExtractor);
    var query = await interaction.options.getString('musique');
    if (query.length < 3) interaction.respond([]);

    var results = await player.search(query);
    tracks = results.tracks.slice(0, 10).map((t) => ({
      name: t.title,
      value: t.url
    }));
    return interaction.respond(tracks);

  },
  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

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

    const player = useMainPlayer();
    player.extractors.register(YouTubeExtractor);
    const query = interaction.options.getString('musique');
    const searchResult = await player.search(query, { requestedBy: interaction.user })

    await interaction.deferReply();
    const res = await player.play(interaction.member.voice.channel, searchResult, {
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