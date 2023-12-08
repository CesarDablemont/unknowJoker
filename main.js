const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, color } = require("./config");
const fs = require('fs');
const { Player } = require('discord-player');
const { YouTubeExtractor, SpotifyExtractor, SoundCloudExtractor, AppleMusicExtractor, AttachmentExtractor } = require('@discord-player/extractor');
const DeezerExtractor = require("discord-player-deezer").default;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMembers
	],
});

client.commands = new Collection();
client.commandArray = [];
client.color = color;

client.player = new Player(client, {
	deafenOnJoin: true,
	ytdlOptions: {
		quality: "highestaudio",
		highWaterMark: 1 << 2
	}
});

client.player.extractors.register(YouTubeExtractor, {});
client.player.extractors.register(SpotifyExtractor, {});
client.player.extractors.register(SoundCloudExtractor, {});
client.player.extractors.register(AppleMusicExtractor, {});
client.player.extractors.register(DeezerExtractor);

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
	const funtionFiles = fs
		.readdirSync(`./src/functions/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of funtionFiles)
		require(`./src/functions/${folder}/${file}`)(client);
};

client.handleEvents();
client.handleCommands();
client.replyEmbed();
client.sendEmbed();
client.hasMusicPerm();
client.login(token);