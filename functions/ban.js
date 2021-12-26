const { WebhookClient, MessageEmbed } = require("discord.js");
const replitDB = require("@replit/database");
const { escapeRegex, getWebHook } = require("../utils");
const db = new replitDB();
const banTimeout = 300; //5min

module.exports = {
  name: "Warn & Ban",
  description: "Totally legit not fake warn and ban",
  async execute(message) {
    if (!(message.content.startsWith("+warn") || message.content.startsWith("+ban"))) return;

    let timeout = await db.get(message.author.id + this.name);
    if (timeout > Date.now()) {
      let waitTime = msToTime(timeout - Date.now())
      await message.reply(`Slow down! You need to wait ${waitTime} more.`).catch(console.error);
    } else {
      var isWarning = message.content.startsWith("+warn")
      const args = message.content.slice(isWarning ? 5 : 4).trim().split(/ +/);

      let who = args[0] ? args[0] : `<@${message.author.id}>`;
      var reason = args[1] ? args[1].toString() : (isWarning ? "" : "no reason given.");

      let description;
      if (isWarning) {
        if (reason.length != 0) {
          description = `***${who} has been warned. ***||** ${reason}**`
        }
        description = `***${who} has been warned. ***`
      } else {
        description = `***${who} has been banned. ***||** ${reason}**`
      }
      let embed = new MessageEmbed()
        .setDescription(description)
        .setColor("#43b582")

      const webhook = await getWebHook(message.client, message.channel.id).then((hookUrl) => (new WebhookClient({ url: hookUrl })));
      //Send Embed using Webhook
      await webhook.send({
        username: "SWProBot",
        avatarURL: "https://cdn.discordapp.com/avatars/155149108183695360/19a5ee4114b47195fcecc6646f2380b1.webp",
        embeds: [embed]
      })
      if (!message.member.permissions.has('MANAGE_MESSAGES'))
        await db.set(message.author.id + this.name, Date.now() + banTimeout);
      await message.delete()
    }
  }
};