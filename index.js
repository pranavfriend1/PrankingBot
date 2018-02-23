const Discord = require("discord.js");
const commando = require("discord.js-commando");
const ytdl = require("ytdl-core");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setGame("PrankforLife! | !!help");
  //client.setYoutubeKey("AIzaSyDt72TZgWCMU6xWlpJysayXESv0VP22hT8");
});
client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrator", "Moderator", "Admin", "Mod", "Owner"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention!
    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the kick!");
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator","Admin", "Owner"].includes(r.name)) )
      return message.reply("Sorry, you don't have permissions to use this!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Please indicate a reason for the ban!");
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    async function purge(){
      let conti = message.content.slice((config.prefix).length).split(" ");
      let argi = conti.slice(1);

      if(isNaN(argi[0])) {
        message.reply("Please mention a number too. \n Usage: " + config.prefix + `purge <amount>"`);
      } else {
        message.delete();
        const fetched = await message.channel.fetchMessages({limit: argi[0]});
        console.log(fetched.size + "messages found, deleting...");
        message.channel.bulkDelete(fetched)
          .catch(error => message.channel.send(`Error: ${error}`));
      }
      
    }
    purge();
  }
  if (command === "motto") {
    message.channel.sendMessage(`***#WeLoveToPoop!***`)
  }
  if (command === "l") {
    message.channel.sendMessage(`***I like Lemon!***`);
  }
  if (command === "help") {
    message.reply(`\n**Bot Name: ${message.client.user},** \n**Prefix:** ${config.prefix}, \n**Usage of commands: ${config.prefix}<command>**
      ***Commands:***
        **Admin:**
            1.  **kick**                 *To kick a User*
            2.  **ban**                 *To ban a User*
            3.  **purge**             *To delete messages. Usage !!purge<number of messages>*
          **Fun:**
            1.  **roll**                   *To roll a die*
            2.  **say**                  *To repeat whatever you want the bot to repeat*
            3.  **motto**              *Says the bots favourite line*
            4.  **l**                        *Says Something about Lamaan.*
    `);
  }
  if (command === "roll" || command === "dice") {
    var roll = Math.floor(Math.random() * 6) + 1;
    message.reply("You rolled a " + roll)
  }  
  if (command === "user-info") {
    let member = message.mentions.members.first();
		return message.reply(`
			Info on **${member}#${member.discriminator}** (ID: ${member.id})

			**❯ Member Details**
			${member.nickname !== null ? ` • Nickname: ${member.nickname}` : ' • No nickname'}
			 • Roles: ${member.roles.map(roles => `\`${roles.name}\``).join(', ')}
			 • Joined at: ${member.joinedAt}

			**❯ User Details**
			 • Created at: ${member.createdAt}${member.bot ? '\n • Is a bot account' : ''}
			 • Status: ${member.presence.status}
			 • Game: ${member.presence.game ? member.presence.game.name : 'None'}
		`);
  }
  if (command = "play") {
    var voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) return message.channel.send("You need to be in a voice channel first!");
    var permissions = voiceChannel.permissionsFor(message.client);
    if (!permissions.has("CONNECT")) {
      return message.channel.send("I cannot connect to your voice channel. Please change my permissions.");
    }
    if(!permissions.has("SPEAK")) {
      return message.channel.send("I cannot speak in your voice channel. Please change my permissions.");
    }
    try {
      var connection = await voiceChannel.join();
    } catch (error) {
      console.error(error);
    }
    var dispatcher = connection.playStream(ytdl(args[1]))
      .on('end', () => {
        console.log("song ended");
        voiceChannel.leave();
      })
      .on('error', error => {
        console.error(error);
      })
    dispatcher.setVolumeLogarithmic(5 / 5);
  }
});

client.login(config.token);
