const { SlashCommandBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const { YouTubeExtractor } = require('@discord-player/extractor');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Joue une radio')
    .addStringOption((option) =>
      option
        .setName('radio')
        .setDescription('La radio a jouer')
        .setRequired(true)
        .addChoices(
          { name: 'Lofi Girl relax/study', value: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
          { name: 'Lofi Girl sleep/chill', value: 'https://www.youtube.com/watch?v=rUxyKA_-grg' },
          { name: 'Relaxing Jazz Piano', value: 'https://www.youtube.com/watch?v=Dx5qFachd3A' },
          { name: 'Coffee shop', value: 'https://www.youtube.com/watch?v=e3L1PIY1pN8' },
          { name: 'Chillout Lounge', value: 'https://www.youtube.com/watch?v=GKLRxLDMz3w' },
          { name: 'The Good Life', value: 'https://www.youtube.com/watch?v=36YnV9STBqc' },
          { name: 'BEACH & REGGAE 2023', value: 'https://www.youtube.com/watch?v=QbnAT9HvNCc' },
          { name: 'Car Music Mix', value: 'https://www.youtube.com/watch?v=aFZmP3b3B4M' },
          { name: 'Billboard Hot 100', value: 'https://www.youtube.com/watch?v=9_d68rTHbV0' },
          { name: 'Rap', value: 'https://www.youtube.com/watch?v=05689ErDUdM' },
        )),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const player = useMainPlayer();
    player.extractors.register(YouTubeExtractor);
    const query = interaction.options.getString('radio');
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

    client.replyEmbed(client, interaction, '', `La radio [${res.track.title}](${res.track.url}) a été ajouté à la file d'attente.`);

  },
};