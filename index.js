const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

let lastLiveVideoId = null;

async function checkLive() {
  try {
    const url =
      `https://www.googleapis.com/youtube/v3/search` +
      `?part=snippet&channelId=${CHANNEL_ID}` +
      `&eventType=live&type=video&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      lastLiveVideoId = null;
      return;
    }

    const live = data.items[0];
    const videoId = live.id.videoId;

    if (videoId === lastLiveVideoId) return;

    lastLiveVideoId = videoId;

    const discordChannel = await client.channels.fetch(
      DISCORD_CHANNEL_ID
    );

    const embed = new EmbedBuilder()
      .setTitle("🔴 ZOOROO IS LIVE!")
      .setDescription(
        `**ZOOROO is LIVE on YouTube!**\n\n` +
        `🎮 Come join the stream and enjoy!`
      )
      .setURL(`https://www.youtube.com/watch?v=${videoId}`)
      .setImage(
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      )
      .setFooter({
        text: "ZOOROO • Live Notifications"
      })
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🔴 WATCH LIVE")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.youtube.com/watch?v=${videoId}`)
    );

    await discordChannel.send({
      content: "@everyone 🔴 **ZOOROO IS LIVE NOW!**",
      embeds: [embed],
      components: [button],
      allowedMentions: {
        parse: ["everyone"]
      }
    });

    console.log("Live alert sent:", videoId);

  } catch (error) {
    console.error("Live check error:", error);
  }
}

client.once("ready", () => {
  console.log(`✅ Zooroo logged in as ${client.user.tag}`);

  checkLive();
  setInterval(checkLive, 60 * 1000);
});

client.login(DISCORD_TOKEN);
