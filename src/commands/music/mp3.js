const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { AttachmentExtractor } = require("@discord-player/extractor");
const { useMainPlayer } = require('discord-player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mp3')
    .setDescription('Joue un fichier mp3')
    .addAttachmentOption((option) =>
      option
        .setName('mp3')
        .setDescription('Le mp3 a jouer')
        .setRequired(true)),

  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    userChannel = interaction.member.voice.channel;
    if (!userChannel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== userChannel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const permissions = userChannel.permissionsFor(client.user);
    if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak))
      return client.replyEmbed(client, interaction, '', "❌ | J'ai besoin des perms pour rejoindre et parler sur le channel!");

    const player = useMainPlayer();
    const mp3 = interaction.options.getAttachment('mp3');
    player.extractors.register(AttachmentExtractor);
    const res = await player.play(interaction.member.voice.channel, mp3.url, {
      nodeOptions: {
        metadata: {
          channel: interaction.channel,
          client: interaction.guild.members.me,
          requestedBy: interaction.user,
        },
        volume: 30,
      },
    });

    client.replyEmbed(client, interaction, '', `[${res.track.title}](${res.track.url}) a été ajouté à la file d'attente.`);

  },
};