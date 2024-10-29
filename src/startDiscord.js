function startDiscord(file){
  const fs = require('fs');
  const { Client, Collection, GatewayIntentBits } = require('discord.js')
  // const { REST } = require('@discordjs/rest');
  // const { Routes } = require('discord-api-types/v9');
  require('dotenv/config');
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMessages, 
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences
    ],
  })
  
  client.commands = new Collection();
  client.uploadQueue = new Collection();
  client.downloadQueue = new Collection();

  const commandFiles = fs.readdirSync('./src/discord').filter(file => file.endsWith('.js'));

  // Load commands from files
  const commands = [];
  for (const file of commandFiles) {
    const command = require(`./discord/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }

  
  // Register commands with Discord
  // const rest = new REST({ version: '9' }).setToken(process.env.token);
  // (async () => {
  //     try {
  //       console.log('Started reloaded application (/) commands.');
  
  //       await rest.put(
  //         Routes.applicationCommands(process.env.clientId),{ body: commands },
  //       );
  
  //       console.log('Successfully reloaded application (/) commands.');
  //     } catch (error) {
  //       console.error(error);
  //     }
  // })();
  
  // Event handlers
  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  // client.on('interactionCreate', async interaction => {
  //   if (interaction.isCommand()) {
  //       const command = client.commands.get(interaction.commandName);
  //       if (!command) return;
  
  //       try {
  //         await command.execute(interaction,client);
  //       } catch (error) {
  //         console.error(error);
  //       }
  
  //   }
  // });
  
  
  client.login(process.env.discordToken);
  return client
}
module.exports = startDiscord