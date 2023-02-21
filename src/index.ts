
// import database from './database' 
// // import schedule from 'node-schedule';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import database from './database/index';
import { deploy } from './deploy/global';
import { BotCommand, Thread } from './types/index';

database(process.env['DB_ADDR'] as string);
deploy();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates
  ],
});
client.commands = new Collection<string, BotCommand>(); // command-name => callback
client.threads = new Collection<string, Thread>(); // user-id => thread

import('./handler/command').then(h => h.handle(client));
import('./handler/event').then(h => h.handle(client));

client.login(process.env['CLIENT_TOKEN']);




import express from 'express';


const app = express();
const PORT = 8080;

app.get('/', function(req, res) {
	res.send('I am alive');
});

app.listen(PORT, function() {
	console.log(`Listening on Port ${PORT}`);
});  