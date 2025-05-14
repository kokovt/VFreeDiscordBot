/*
    * Koko
    * May 12, 2025
*/

// #############
// ## IMPORTS ##
// #############
import dotenv from "dotenv";
import { GatewayIntentBits, Message } from "discord.js";
import { VFreeBot } from "./VFreeBot/bot";

//? Get .env data
dotenv.config();

// #########
// ## ENV ##
// #########
const DISCORDTOKEN: string | undefined = process.env.DISCORDTOKEN;

if (!DISCORDTOKEN) {
  console.error("Discord token was not set!");
  process.exit();
}

const intents: Array<GatewayIntentBits> = [];
const VFREEBOT = new VFreeBot(intents, DISCORDTOKEN);
