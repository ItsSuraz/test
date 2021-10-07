
const fs = require('fs');
const Discord = require('discord.js');
const log = require(`leekslazylogger`);
const config = require('./config.json');
const { openTicket, closeTicket, purTicket, rewTicket } = require('./controllers/ticket.js')
const client = new Discord.Client();
const { readdirSync } = require("fs");
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
const now = Date.now();
const webserver = require('./server.js');
webserver.run();

const discord = require('./discord.js');
discord.run();

let trigger = null;

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
log.init('Falt Bot')
log.info(`Starting up...`)


/**
 * Cuando logea
 */
 client.once('ready', () => {

  log.info(`Empezando a iniciar el bot.`)
  for (const file of commands) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
    log.console(`> Loading '${config.Botinfo.Prefix}${command.name}'`);
  }

  log.success(`Conected`)
  log.success(`Logged in ${client.user.tag}`)
  client.user.setPresence({ activity: { name: config.Botinfo.Activity, type: config.Botinfo.Playering, url: config.Botinfo.URL }, status: "dnd"});


  const { GiveawaysManager } = require('discord-giveaways');
client.giveawaysManager = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    updateCountdownEvery: 5000,
    default: {
        botsCanWin: config.Giveaways.BotsCanWin,
        embedColor: config.Giveaways.EmebdColor,
        embedColorEnd: config.Giveaways.EmbedColorEnd,
        reaction: config.Giveaways.EmojiGiveawayReaction
    }
});

if (config.Stats.Enabled) {
client.on('guildMemberAdd', async member => {
  if (member.guild.id !== config.Guild.GuildID) return;
  let channels = {
    members: client.channels.cache.get(config.Stats.MemberCountID),
    humans: client.channels.cache.get(config.Stats.HumanCountID),
    bots: client.channels.cache.get(config.Stats.BotsCountID),
    boost: client.channels.cache.get(config.Stats.BoostCountID),
    textc: client.channels.cache.get(config.Stats.TextChannelCountID)
  };
  channels.members.setName(`Members: ${member.guild.memberCount}`).catch(err => { })
  channels.humans.setName(`Humans: ${member.guild.members.cache.filter(x => !x.user.bot).size}`).catch(err => { })
  channels.bots.setName(`Bots: ${member.guild.members.cache.filter(x => x.user.bot).size}`).catch(err => { })
  channels.boost.setName(`Boost: ${member.guild.premiumSubscriptionCount || '0'}`).catch(err => { })
  channels.textc.setName(`Text Channels: ${member.guild.channels.cache.filter(channel => channel.type === 'text').size}`).catch(err => { })

});
}

 if (config.Stats.Enabled) {
client.on('guildMemberRemove', async member => {
  if (member.guild.id !== config.Guild.GuildID) return;
  let channels = {
    members: client.channels.cache.get(config.Stats.MemberCountID),
    humans: client.channels.cache.get(config.Stats.HumanCountID),
    bots: client.channels.cache.get(config.Stats.BotsCountID),
    boost: client.channels.cache.get(config.Stats.BoostCountID),
    textc: client.channels.cache.get(config.Stats.TextChannelCountID)
  };
  channels.members.setName(`Members: ${member.guild.memberCount}`).catch(err => { })
  channels.humans.setName(`Humans: ${member.guild.members.cache.filter(x => !x.user.bot).size}`).catch(err => { })
  channels.bots.setName(`Bots: ${member.guild.members.cache.filter(x => x.user.bot).size}`).catch(err => { })
  channels.boost.setName(`Boost: ${member.guild.premiumSubscriptionCount || '0'}`).catch(err => { })
  channels.textc.setName(`Text Channels: ${member.guild.channels.cache.filter(channel => channel.type === 'text').size}`).catch(err => { })
});
 }

/**
 * Import all commands
 */
 fs.readdir("./commands/tickets/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
      if (!file.endsWith(".js")) return;
      const command = require(`./commands/tickets/${file}`);
      let commandName = file.split(".")[0];
      console.log(`Loading tickets command ${commandName}`);
      client.commands.set(command.name, command);
  });
});

fs.readdir("./commands/staff/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
      if (!file.endsWith(".js")) return;
      const command = require(`./commands/staff/${file}`);
      let commandName = file.split(".")[0];
      console.log(`Loading staff command ${commandName}`);
      client.commands.set(command.name, command);
  });
});

fs.readdir("./commands/suggest/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
      if (!file.endsWith(".js")) return;
      const command = require(`./commands/suggest/${file}`);
      let commandName = file.split(".")[0];
      console.log(`Loading suggest command ${commandName}`);
      client.commands.set(command.name, command);
  });
});

client.giveawaysManager.on("giveawayReactionAdded", (giveaway, member, reaction) => {
  if (member.id !== client.user.id){
      console.log(`${member.user.tag} entered giveaway #${giveaway.messageID} (${reaction.emoji.name})`);
  }
});

client.giveawaysManager.on("giveawayReactionRemoved", (giveaway, member, reaction) => {
  if (member.id !== client.user.id){
      console.log(`${member.user.tag} left giveaway #${giveaway.messageID} (${reaction.emoji.name})`);
  }
});

  if (config.Botinfo.UseEmbeds) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
      .setColor("#2ECC71")
      .setDescription(":white_check_mark: **Started succesfully**")
      .setThumbnail(config.Guild.Thumbnail)
      .setFooter(`${config.Botinfo.Name} | Support`);
    client.channels.cache.get(config.Guild.LogsChannelID).send(embed)
  } else {
    client.channels.cache.get(config.Guild.LogsChannelID).send(":white_check_mark: **Started succesfully**")
  }
  if (client.guilds.cache.get(config.Guild.GuildID).member(client.user).hasPermission("ADMINISTRATOR", false)) {
    log.info(`Checking permissions...`);
    setTimeout(function() {
      log.success(`Required permissions have been granted\n\n`)
    }, 1250);
   
    if (config.useEmbeds) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#2ECC71")
        .setDescription(":white_check_mark: **Required permissions have been granted**")
        .setThumbnail(config.Guild.Thumbnail)
        .setFooter(`${config.Botinfo.Name} | Support`);
      client.channels.cache.get(config.Guild.LogsChannelID).send(embed)
    } else {
      client.channels.cache.get(config.Guild.LogsChannelID).send(":white_check_mark: **Started succesfully**")
    }
  } else {
    log.error(`Required permissions have not been granted`)
    log.error(`Please give the bot the 'ADMINISTRATOR' permission\n\n`)
    if (config.Botinfo.UseEmbeds) {
      const embed = new Discord.MessageEmbed()
        .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
        .setColor("#E74C3C")
        .setDescription(":x: **Required permissions have not been granted**\nPlease give the bot the `ADMINISTRATOR` permission")
        .setThumbnail(config.Guild.Thumbnail)
        .setFooter(`${config.Botinfo.Name} | Support`);
      client.channels.cache.get(config.Guild.LogsChannelID).send({
        embed
      })
    } else {
      client.channels.cache.get(config.Guild.LogsChannelID).send(":white_check_mark: **Started succesfully**")
    }
  }

  /**
   * Enviar el mensaje en el canal de soporte
   */
  if (config.Botinfo.UseEmbeds) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`Support Panel`)
      .setColor(config.Ticket.ColorPanelMessage)
      .addField("**Support**", `React with ${config.Ticket.SupportEmoji} to open a Support ticket\n`)
      .addField("**Tebex**", `React with ${config.Ticket.BuyEmoji} to open a Buy ticket\n`)
      .addField("**Rewards**", `React with ${config.Ticket.RewardsEmoji} to open a Rewards ticket\n`)

    const PanelMessage = client.channels.cache.get(config.Ticket.PanelMessageID);

    PanelMessage.bulkDelete(10);

    PanelMessage.send(embed)
      .then((message) => {
        message.react(config.Ticket.SupportEmoji)
        message.react(config.Ticket.BuyEmoji)
        message.react(config.Ticket.RewardsEmoji)
        .catch((err) => console.error("Failed to react"))

        trigger = message.id;
      })
      .catch((err) => console.error(`Message was not send: ${err}`))
  } 
  else {
    PanelMessage.send(`React with ${config.Ticket.SupportEmoji} to create a support ticket`)
      .then((message) => {
      })
      .catch((err) => console.error(`Message was not send: ${err}`));
  }
 })
/**
 * Escuchando las reacciones para abrir los tickets
 */
client.on('messageReactionAdd', async (reaction, user) => {
  if (trigger != null) {
    if (reaction.message.id === trigger && user.id !== client.user.id && reaction.emoji.name === config.Ticket.SupportEmoji) {
      openTicket(reaction.message, user)
      reaction.users.remove(user);
      }
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (trigger != null) {
    if (reaction.message.id === trigger && user.id !== client.user.id && reaction.emoji.name === config.Ticket.BuyEmoji) {
      purTicket(reaction.message, user)
      reaction.users.remove(user);
      }
    }
})

client.on('messageReactionAdd', async (reaction, user) => {
  if (trigger != null) {
    if (reaction.message.id === trigger && user.id !== client.user.id && reaction.emoji.name === config.Ticket.RewardsEmoji) {
      rewTicket(reaction.message, user)
      reaction.users.remove(user);
      }
    }
})

client.on('messageReactionRemove', async (reaction, user) => {
  if (reaction.message.partial) {
    try {
      await reaction.message.fetch();
    } catch (error) {
      console.log('mierda')
    }
  }
  console.log(`${user.username} removed their "${reaction.emoji.name}" reaction.`);
});

/**
 * DM Log
 */
client.on('message', async message => {
  if (message.author.bot) return;
  if (message.channel.type === "dm") {
    if (message.author.id === client.user.id) return;
    if (config.logDMs) {
      if (config.Botinfo.UseEmbeds) {
        const embed = new Discord.MessageEmbed()
          .setAuthor(`${client.user.username} / Ticket Log`, client.user.avatarURL)
          .setTitle("DM Logger")
          .addField("Username", message.author.tag, true)
          .addField("Message", message.content, true)
          .setThumbnail(config.Guild.Thumbnail)
          .setFooter(`${config.Botinfo.Name} | Support`);
        client.channels.cache.get(config.Guild.LogsChannelID).send(embed)
      } else {
        client.channels.cache.get(config.Guild.LogsChannelID).send(`DM received from **${message.author.tag} (${message.author.id})** : \n\n\`\`\`${message.content}\`\`\``);
      }
    } else {
      return
    };

  }
  if (message.channel.bot) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|\\${config.Botinfo.Prefix})\\s*`);
  if (!prefixRegex.test(message.content)) return;
  const [, matchedPrefix] = message.content.match(prefixRegex);
  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

  if (command.guildOnly && message.channel.type !== 'text') {
	   return message.channel.send(`Sorry, this command can only be used on the server.`)
  }

  if (command.args && !args.length) {
    if (config.Botinfo.UseEmbeds) {
      const embed = new Discord.MessageEmbed()
          .setColor("#E74C3C")
          .setDescription(`\n**Usage:** \`${config.Botinfo.Prefix}${command.name} ${command.usage}\`\n`)
        return message.channel.send({embed})

    } else {
      return message.channel.send(`**Usage:** \`${config.Botinfo.Prefix}${command.name} ${command.usage}\`\n`)
    }
  };


  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      if (config.Botinfo.UseEmbeds) {
        const embed = new Discord.MessageEmbed()
          .setColor("#E74C3C")
          .setDescription(`:x: **Please do not spam commands** (wait ${timeLeft.toFixed(1)}s)`)
          .setThumbnail(config.Guild.Thumbnail)
          .setFooter(`${config.Botinfo.Name} | Support`);
        return message.channel.send({embed})
      } else {
        return message.reply(`please do not spam commands (wait ${timeLeft.toFixed(1)}s)`);
      }

    }
  }
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


  try {
    command.execute(client, message, args);
    log.console(`${message.author.tag} used the '${command.name}' command`)
  } catch (error) {
    log.error(error);
    message.channel.send(`:x: **Oof!** An error occured whilst executing that command.\nThe issue has been reported.`);
    log.error(`An unknown error occured whilst executing the '${command.name}' command`);
  }

});

/**
 * Error
 */
client.on('error', error => {
  log.warn(`Potential error detected\n(likely Discord API connection issue)\n`);
  log.error(`Client error:\n${error}`);
});
client.on('warn', (e) => log.warn(`${e}`));

if(config.debugLevel == 1){ client.on('debug', (e) => log.debug(`${e}`)) };

process.on('unhandledRejection', error => {
  log.warn(`An error was not caught`);
  log.error(`Uncaught error: \n${error.stack}`);
});
process.on('beforeExit', (code) => {
  log.basic(log.colour.yellowBright(`Disconected from Discord API`));
  log.basic(`Exiting (${code})`);
});

/**
 * Gaston#1963
 */
client.login(config.Botinfo.Token);
