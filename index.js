const fs = require('node:fs');
const path = require('node:path');
const { Partials,Client, Collection, GatewayIntentBits} = require('discord.js');
const { token , appKey, appSecret, accessToken, accessSecret, twitterid, twitterChannel} = require('./config.json');
const cron = require("node-cron");
const { TwitterApi } = require("twitter-api-v2");

const client = new Client(    {
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Channel],
}
);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}

}

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
  
}


client.login(token);

//Twitter

const clienttwitter = new TwitterApi({
  appKey: appKey,
  appSecret: appSecret,
  accessToken: accessToken,
  accessSecret: accessSecret,
});

async function fetchTweets() {
  const userTimeline = await clienttwitter.v1.userTimeline(twitterid, {
    exclude_replies: true,
    include_rts: false,
  });
  return userTimeline.tweets;
}

let id_tweet;
(async () => {
  const fetchedTweets = await fetchTweets();
  id_tweet = fetchedTweets[0].id;
  cron.schedule("*/3 * * * *", async () => {
    const fetchedTweets = await fetchTweets();
    if (fetchedTweets[0].id !== id_tweet) {
      const channel = client.channels.cache.get(twitterChannel);
      channel.send(`https://twitter.com/Hyakanime/status/${fetchedTweets[0].id_str}`);
      id_tweet = fetchedTweets[0].id;
    }
  });
})();
