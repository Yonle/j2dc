console.log("[Module] Now Loading Modules....");
require("dotenv").config();
console.log("[Module] dotenv Loaded.");
const { Client } = require("discord.js");
console.log("[Module] discord.js Loaded.");
const { BOT_TOKEN, BOT_PREFIX } = process.env;
console.log("[Config] Loaded config from .env File with dotenv");
var commandJson = require("./commands.json");
console.log("[Command] Loaded command JSON");
var command = new Map(Object.entries(commandJson));
console.log("[Command] Ready");

var refreshCommand = (() => {
	try {
		delete require.cache[require.resolve("./commands.json")];
		commandJson = require("./commands.json");
	} catch (error) {
		console.error(error);
	} finally {
		command = new Map(Object.entries(commandJson));
	}
});

if (!BOT_TOKEN) {
	console.error("[TOKEN] Missing Token.");
	return process.exit(1);
} else if (!BOT_PREFIX) {
	console.warn("[PREFIX] No prefix provided. Using ! as default");
}
var bot = new Client();
console.log("[BOT] Client Loaded.");
console.log("----------------", "Begin");
bot.login(BOT_TOKEN).catch(console.error);

bot.on('debug', console.log);
bot.on('warn', console.warn);
bot.on('error', console.error);
bot.on('message', (message) => {

	if (!message) return;

	// Required Object
	var chatID = message.channel.id;
	var userID = message.author.id;
	var userName = message.author.tag;
	var robotID = bot.user.id;
	var isBot = message.author.bot;
	var text = message.content;
	if (!text) return;
	var cmd = text.slice((BOT_PREFIX||"!").length).split(" ")[0];

	// Required Functions
	message.say = (txt => message.channel.send(txt));

	if (userID === robotID) return;
	if (isBot) return;
	if (!text.startsWith(BOT_PREFIX||"!")) return;
	if (!command) refreshCommand();

	var response = command.get(cmd);
	if (!response) return;
	// If the response startsWith "eval:", Slice and eval the code instead of sending message.
	if (response.startsWith("eval:")) {
		try {
			eval(response.slice(5));
		} catch (error) {
			message.say("Something went wrong when executing this command. If you're the owner of this bot, Check your console and JSON exec code and try again.").catch(console.error);
			console.error(error);
		}
	} else {
		message.say(response).catch(console.error);
	}
	console.log(`[Command] ${userName}(${userID}) is Executing '${cmd}' command.`);

});

// Refresh command every 100ms
setInterval(refreshCommand, 100);
