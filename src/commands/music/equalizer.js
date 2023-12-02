const { SlashCommandBuilder } = require('discord.js');
const { useQueue, EqualizerConfigurationPreset } = require('discord-player');
const fs = require('fs');
const dbPath = "./data/music.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName('equalizer')
    .setDescription('equalizer')
    .addStringOption((option) =>
      option
        .setName('preset')
        .setDescription('Le preset à appliquer')
        .addChoices(
          { name: 'Off', value: 'Off' },
          { name: 'Classique', value: 'Classical' },
          { name: 'Club', value: 'Club' },
          { name: 'Dance', value: 'Dance' },
          { name: 'Plat', value: 'Flat' },
          { name: 'FullBass', value: 'FullBass' },
          { name: 'FullBassTreble', value: 'FullBassTreble' },
          { name: 'FullTreble', value: 'FullTreble' },
          { name: 'Ecouteur', value: 'Headphones' },
          { name: 'Grande salle', value: 'LargeHall' },
          { name: 'Live', value: 'Live' },
          { name: 'Soirée', value: 'Party' },
          { name: 'Pop', value: 'Pop' },
          { name: 'Reggae', value: 'Reggae' },
          { name: 'Rock', value: 'Rock' },
          // { name: 'Ska', value: 'Ska' },
          { name: 'Soft', value: 'Soft' },
          { name: 'SoftRock', value: 'SoftRock' },
          { name: 'Techno', value: 'Techno' },
        )
        // .addChoices(
        //   ...Object.keys(EqualizerConfigurationPreset).map((m) => ({
        //     name: m,
        //     value: m
        //   }))
        // )
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

    const preset = interaction.options.getString('preset');
    if (preset === "Off") {
      await queue.filters.equalizer.disable();
      return client.replyEmbed(client, interaction, '', `☑️ | **Equaliser désactivé**`);
    }

    await queue.filters.equalizer.setEQ(EqualizerConfigurationPreset[preset]);
    await queue.filters.equalizer.enable();
    client.replyEmbed(client, interaction, '', `☑️ | **Equaliser** filter has been set to: **\`${preset}\`**`);

  },
};