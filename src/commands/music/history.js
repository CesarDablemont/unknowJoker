const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useHistory } = require('discord-player');
const { emojis } = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Affiche la liste des musiques passées'),
  async execute(client, interaction) {

    canPlay = await client.hasMusicPerm(interaction, "dj_only");
    if (!canPlay) return;

    if (!interaction.member.voice.channel)
      return client.replyEmbed(client, interaction, '', "❌ | Tu doit être dans un channel vocal !");

    if ((await interaction.guild.members.fetchMe()).voice.channel && (await interaction.guild.members.fetchMe()).voice.channel.id !== interaction.member.voice.channel.id)
      return client.replyEmbed(client, interaction, '', "❌ | Je suis déjà connecté ailleurs !");

    const history = useHistory(interaction.guild.id);
    if (!history) return client.replyEmbed(client, interaction, '', "ℹ️ | Il n'y a pas d'historique !");
    if (!history.tracks || !history.currentTrack) return client.replyEmbed(client, interaction, '', "ℹ️ | Il n'y a pas d'historique !");
    if (history.tracks.size < 1) return client.replyEmbed(client, interaction, '', "ℹ️ | Il n'y a pas d'historique !");

    interaction.deferReply();
    interaction.deleteReply();

    let currentPage = 0;
    const embeds = HistoryEmbed(history);

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("left")
        .setEmoji(emojis.arrowLeft),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("right")
        .setEmoji(emojis.arrowRight))

    const historyEmbed = await interaction.channel.send({
      embeds: [embeds[currentPage]
        .setColor(client.color)
        .setTitle(`Page ${currentPage + 1}/${embeds.length}  |  Total ${history.tracks.size + 1} Musiques`)
        .setFooter({
          text: `Demandé par ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
        })],
      components: [btn]
    });

    const filter = async () => true;
    const collector = historyEmbed.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async button => {
      switch (button.customId) {

        case "right":
          await button.deferUpdate()

          if (currentPage < embeds.length - 1) {
            currentPage++;
            historyEmbed.edit({
              embeds: [embeds[currentPage]
                .setColor(client.color)
                .setTitle(`Page ${currentPage + 1}/${embeds.length}  |  Total ${history.tracks.size + 1} Musiques`)
                .setFooter({
                  text: `Demandé par ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })],
              components: [btn]
            });
          }
          break;

        case "left":
          await button.deferUpdate()

          if (currentPage !== 0) {
            --currentPage;
            historyEmbed.edit({
              embeds: [embeds[currentPage]
                .setColor(client.color)
                .setTitle(`Page ${currentPage + 1}/${embeds.length}  |  Total ${history.tracks.size + 1} Musiques`)
                .setFooter({
                  text: `Demandé par ${interaction.user.tag}`,
                  iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
                })],
              components: [btn]
            });
          }
          break;
      }
    });

  },
};

function HistoryEmbed(history) {

  const embeds = [];
  let k = 10;
  for (let i = 0; i < history.tracks.size; i += 10) {
    const current = history.tracks.toArray().slice(i, k);
    let j = i;
    k += 10;

    const info = current.map((track) => `**${++j} -** [${track.title}](${track.url})`).join("\n");
    if (!info) return;

    const embed = new EmbedBuilder()
      .setDescription(`**En cours de lecture: [${history.currentTrack?.title}](${history.currentTrack?.url})**\n${info}`);
    embeds.push(embed);
  }
  return embeds;
};