// Packages
const Discord = require('discord.js');
const { Signale } = require('signale');
const pool = require('./pool.js');

// Config
const config = require('./config.json');

// Variables
const intents = new Discord.Intents();
if (config.Verification['Privileged-intents']) intents.add('GUILD_MEMBERS', 'DIRECT_MESSAGES');
const client = new Discord.Client({ ws: { intents: intents } });
const logger = new Signale({ scope: 'Falt Bot' });

function main() {
    logger.info('Logging in...');
    client.login(config.Botinfo.Token).catch(() => {
        logger.fatal('Failed to login!');
        process.exit(0);
    }).then(() => {
        logger.success('Logged in!');
    });
}

// Events
// Send user the captcha when they join the server
client.on('guildMemberAdd', member => {
    const linkID = pool.createLink(member.id);
    const embed = new Discord.MessageEmbed()
        .setTitle('Falt - Verification')
        .setThumbnail(`${config.Guild.Thumbnail}`)
        .setDescription(`We need to verify that your a human.\nPlease complete the Captcha below.\n\n**Link:**\n${config.Verification.https ? 'https://' : 'http://'}${config.Verification.Domain}/verification/${linkID}`)
        .setColor("#FF0000");
    member.send(embed).catch(() => {
        client.channels.cache.get(config.Verification.DMCloseChannelID).send(`Failed to send captcha to ${member.user.tag}! (Maybe they have DMs turned off?)`)
    });
});

// Add verified role to user
async function addRole(userID) {
    try {
        const guild = await client.guilds.fetch(config.Guild.GuildID);
        const role = await guild.roles.fetch(config.Verification.VerificationRoleID);
        const member = await guild.members.fetch(userID);
        member.roles.add(role).catch(() => {
            client.channels.cache.get(config.Guild.LogsChannelID).send(`Failed to add role to user ${member.user.tag}! (Maybe verified role is above bot role?)`)
            return;
        });
            client.channels.cache.get(config.Guild.LogsChannelID).send(`Added verified role to user ${member.user.tag}.`)
    } catch (e) {
            client.channels.cache.get(config.Guild.LogsChannelID).send(`Failed to add role to user ${userID}!`)
    }
}

module.exports = {
    run: main,
    addRole
};
