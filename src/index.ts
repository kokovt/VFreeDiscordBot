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
import express from "express";
import setup_express from "./server";
import { MongoClient } from "mongodb";

//? Get .env data
dotenv.config();

// #########
// ## ENV ##
// #########
const DISCORDTOKEN: string | undefined = process.env.DISCORDTOKEN;
const MONGODBURI: string | undefined = process.env.MONGODBURI;

if(!DISCORDTOKEN) {
    console.error("Discord token was not set!");
    process.exit();
}

if(!MONGODBURI) {
    console.error("MONGO DB URI was not set!");
    process.exit();
}


const intents: Array<GatewayIntentBits> = [];
const VFREEBOT = new VFreeBot(intents, DISCORDTOKEN);

const MONGODBCLIENT = new MongoClient(MONGODBURI);

async function connectToDB() {
    try {
        await MONGODBCLIENT.connect();
        console.log("Connected to MongoDB");
    } catch(e) {
        console.error(e);
    }
}
setup_express();


connectToDB();

process.on("beforeExit", () => {
    MONGODBCLIENT.close();
})



export default MONGODBCLIENT;