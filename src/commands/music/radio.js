const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const dbPath = "./data/music.json";

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

    const db = fs.readFileSync(dbPath);
    const data = JSON.parse(db);

    const guildId = interaction.guild.id;
    if (data[guildId].djMode == "DJ Only" && !interaction.member.roles.cache.some(r => r.id == data[guildId].djRole))
      return client.replyEmbed(client, interaction, '', "❌ | Il faut le rôle DJ pour utiliser cette commande !");

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const radio = interaction.options.getString('radio');
    const res = await client.player.play(interaction.member.voice.channel, radio, {
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