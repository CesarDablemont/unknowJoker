const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { useHistory, QueueRepeatMode } = require('discord-player');
const { emojis } = require('../../../config.json');

const fs = require('fs');
const dbPath = "./data/music.json";
const db = fs.readFileSync(dbPath);
const data = JSON.parse(db);

module.exports = {
  name: "playerStart",
  async execute(client, queue, track) {

    const guildId = queue.metadata.channel?.guild.id;
    const ancienPlayMessage = data[guildId].playMessage;
    const ancienPlayChannel = data[guildId].playChannel;

    const history = useHistory(queue.metadata.channel?.guild.id);
    var previousButtonMode = false;
    if (!history) previousButtonMode = true;
    if (!history.previousTrack) previousButtonMode = true;

    var shuffleButtonMode = false;
    if (queue.tracks.size < 2) shuffleButtonMode = true;

    var PlayPauseButtonEmoji;
    if (queue.node.isPaused() === false) {
      PlayPauseButtonEmoji = emojis.pause;
    } else if (queue.node.isPaused() === true) {
      PlayPauseButtonEmoji = emojis.play;
    }

    var autoplayButtonStyle;
    if (queue.repeatMode === 0) {
      autoplayButtonStyle = ButtonStyle.Secondary;
    } else {
      autoplayButtonStyle = ButtonStyle.Success;
    }

    try {
      const guild = await queue.metadata.channel?.guild.channels.cache.get(`${ancienPlayChannel}`);
      await guild.messages.cache.get(`${ancienPlayMessage}`).delete();
    } catch (e) {
      console.log("playerStart Error: can't delete old msg");
    };
    // console.log("continue running");

    let embed = new EmbedBuilder()
      .setColor(client.color)
      .setTitle('🎶 En cours de lecture 🎶')
      .setDescription(`[${track.title}](${track.url})`)
      .setThumbnail(track.thumbnail)
      .setFooter({
        text: `Ajouté par ${queue.metadata.requestedBy.tag}`,
        iconURL: queue.metadata.requestedBy.displayAvatarURL({ dynamic: true }),
      });

    const Previous = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel(' ')
      .setCustomId("previous")
      .setEmoji(emojis.previous)
      .setDisabled(previousButtonMode);

    const Shuffle = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel(' ')
      .setCustomId("shuffle")
      .setEmoji(emojis.shuffle)
      .setDisabled(shuffleButtonMode);

    const PlayPause = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel(' ')
      .setCustomId("play/pause")
      .setEmoji(PlayPauseButtonEmoji);

    const Autoplay = new ButtonBuilder()
      .setStyle(autoplayButtonStyle)
      .setLabel(' ')
      .setCustomId("autoplay")
      .setEmoji(emojis.autoplay);

    const Skip = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel(' ')
      .setCustomId("skip")
      .setEmoji(emojis.next);

    const Buttons = new ActionRowBuilder().addComponents(Previous, Shuffle, PlayPause, Autoplay, Skip);

    queue.metadata.channel?.send({ embeds: [embed], components: [Buttons] }).then(async msg => {

      data[guildId].playMessage = msg.id;
      data[guildId].playChannel = msg.channel.id;

      const pushData = JSON.stringify(data);
      await fs.writeFile(dbPath, pushData, function (err) {
        if (err) console.error(err);
      });

      const filter = async () => true;
      const collector = msg.createMessageComponentCollector({ filter, time: track.duration * 1000 + (5 * 60 * 1000) });

      collector.on("collect", async button => {

        switch (button.customId) {

          case "previous":
            await button.deferUpdate();
            if (data[guildId].djMode == "DJ Only" && !button.member.roles.cache.some(r => r.id == data[guildId].djRole)) return;

            await history.previous();
            break;

          case "shuffle":
            await button.deferUpdate();
            if (data[guildId].djMode == "DJ Only" && !button.member.roles.cache.some(r => r.id == data[guildId].djRole)) return;

            await queue.tracks.shuffle();
            msg.reply({ content: "Queue mélangé", ephemeral: true });
            break;

          case "play/pause":
            await button.deferUpdate();
            if (data[guildId].djMode == "DJ Only" && !button.member.roles.cache.some(r => r.id == data[guildId].djRole)) return;

            var PlayPauseButtonEmoji;
            if (queue.node.isPaused() === false) {
              PlayPauseButtonEmoji = emojis.play;
              await queue.node.pause(msg);
            } else if (queue.node.isPaused() === true) {
              PlayPauseButtonEmoji = emojis.pause;
              await queue.node.resume(msg);
            }

            const PlayPause3 = new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(' ')
              .setCustomId("play/pause")
              .setEmoji(PlayPauseButtonEmoji);

            var autoplayButtonStyle;
            if (queue.repeatMode === 0) {
              autoplayButtonStyle = ButtonStyle.Secondary;
            } else {
              autoplayButtonStyle = ButtonStyle.Success;
            }

            const Autoplay3 = new ButtonBuilder()
              .setStyle(autoplayButtonStyle)
              .setLabel(' ')
              .setCustomId("autoplay")
              .setEmoji(emojis.autoplay);

            const Buttons3 = new ActionRowBuilder().addComponents(Previous, Shuffle, PlayPause3, Autoplay3, Skip);
            button.editReply({ components: [Buttons3] })
            break;

          case "autoplay":
            await button.deferUpdate();
            if (data[guildId].djMode == "DJ Only" && !button.member.roles.cache.some(r => r.id == data[guildId].djRole)) return;

            var PlayPauseButtonEmoji;
            if (queue.node.isPaused() === false) {
              PlayPauseButtonEmoji = emojis.pause;
            } else if (queue.node.isPaused() === true) {
              PlayPauseButtonEmoji = emojis.play;
            }

            const PlayPause4 = new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setLabel(' ')
              .setCustomId("play/pause")
              .setEmoji(PlayPauseButtonEmoji);

            var autoplayButtonStyle;
            if (queue.repeatMode === 0) {
              autoplayButtonStyle = ButtonStyle.Success;
              await queue.setRepeatMode(QueueRepeatMode.AUTOPLAY);
            } else {
              autoplayButtonStyle = ButtonStyle.Secondary;
              await queue.setRepeatMode(QueueRepeatMode.OFF);
            }

            const Autoplay4 = new ButtonBuilder()
              .setStyle(autoplayButtonStyle)
              .setLabel(' ')
              .setCustomId("autoplay")
              .setEmoji(emojis.autoplay);

            const Buttons4 = new ActionRowBuilder().addComponents(Previous, Shuffle, PlayPause4, Autoplay4, Skip);
            button.editReply({ components: [Buttons4] })
            break;

          case "skip":
            await button.deferUpdate();
            if (data[guildId].djMode == "DJ Only" && !button.member.roles.cache.some(r => r.id == data[guildId].djRole)) return;
            await queue.node.skip(msg);
            break;

        }
      });
    });

  },
};