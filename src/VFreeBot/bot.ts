/*
    * Koko
    * May 12, 2025
*/

// #############
// ## IMPORTS ##
// #############
import { ActivityType, Client, Message, CommandInteraction, GatewayIntentBits, AutocompleteInteraction, MessageFlags } from "discord.js";
import { glob } from "glob";

// ###############
// ## CLASS DEF ##
// ###############
export class VFreeBot {
    CLIENT: Client;
    commands: Array<command>;

    constructor(intents: Array<GatewayIntentBits>, token: string) {
        this.CLIENT = new Client({
            intents: intents
        });

        this.commands = [];
        this.#handleEvents();
        this.CLIENT.login(token);
    }

    #handleEvents() {
        this.CLIENT.on("ready", async () => {
            this.CLIENT.user?.setPresence({
                status: "dnd",
                activities: [{
                    name: "Be free. Be you.",
                    type: ActivityType.Custom
                }]
            });

            console.log(`${this.CLIENT.user?.displayName} is online!`);

            this.#registerCommands();
        });

        this.CLIENT.on("interactionCreate", async (interaction) => {
            let interaction_check = (name: string, inter: CommandInteraction | AutocompleteInteraction) => name !== inter.commandName;
            
            if(interaction.isAutocomplete()) {
                let autocomplete_interaction: AutocompleteInteraction = interaction;

                for(let i = 0; i < this.commands.length; i++) {
                    if(interaction_check(this.commands[i].interaction.name, interaction)) continue;
                    
                    await this.commands[i].autocomplete?.(autocomplete_interaction);
                }
            }

            if(!interaction.isCommand()) return;

            for(let i = 0; i < this.commands.length; i++) {
                if(interaction_check(this.commands[i].interaction.name, interaction)) continue;

                try {
                    if(this.commands[i].ephemeral == true) {
                        await interaction.deferReply({
                            flags: MessageFlags.Ephemeral // emphemeral: true was good enough. This is more complicated than needed.
                        });
                    } else {
                        await interaction.deferReply();
                    }

                    await this.commands[i].run(this, interaction);
                    return;
                } catch(err: any) { // For some reason you cant say the error is of type "Error"
                    console.error(err.message);
                    interaction.followUp({ flags: MessageFlags.Ephemeral, content: "Error running command!"});
                }
            }

            interaction.reply({ flags: MessageFlags.Ephemeral, content: "Coulnd't find command!"});
        });
    }

    async #registerCommands() {
        const FILES = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/VFreeBot/commands/**/*.js`); // Replace the backslashes with forwardslashes for windows users. Wierd edgecase.

        for(let i = 0; i < FILES.length; i++) {
            const COMMAND: any = require(FILES[i]).default;

            if(!COMMAND.interaction.name) continue;

            this.commands.push(COMMAND);

            if(this.CLIENT.isReady()) {
                this.CLIENT.application.commands.create(COMMAND.interaction);
            }
        }
    }
}


export class commandBuilder {
    #command: command;
    #changedName: boolean;
    #changedRun: boolean;
    #changedDescription: boolean;
    constructor() {
        this.#changedName = false;
        this.#changedDescription = false;
        this.#changedRun = false;
        this.#command = {
            interaction: {
                name: "placeholder",
                description: "placeholder"
            },
            ephemeral: true,
            async run(VFreeBot, interaction) {}
        };
        return this;
    }
    setInteractionType(type: 1 | 2 | 3) { 
        this.#command.interaction.type = type;
        return this;
     }
    setName(name: string) { 
        this.#changedName = true;
        this.#command.interaction.name = name;
        return this; 
    }

    setNameLocalizations(localizations: { [id: string] : string}) { 
        this.#command.interaction.name_localizations = localizations;
        return this; 
    }

    setDescription(description: string) { 
        this.#changedDescription = true;
        this.#command.interaction.description = description;
        return this;
    };

    setOptions(options: Array<commandOption>) {
        this.#command.interaction.options = options;
        return this;
    }

    setDefaultMemberPermissions(permissions: string) {
        this.#command.interaction.default_member_permissions = permissions;
        return this;
    }

    setDefaultPermissions(default_permission: boolean) {
        this.#command.interaction.default_permission = default_permission;
        return;
    }

    setEphemeral(ephemeral: boolean) {
        this.#command.ephemeral = ephemeral;
        return this;
    }

    setRunFunction(run: (VFreeBot : VFreeBot, interaction: CommandInteraction) => Promise<any>) {
        this.#changedRun = true;
        this.#command.run = run;
        return this;
    }

    setAutocompletFunction(autocomplete: (interaction: AutocompleteInteraction) => Promise<any>) {
        this.#command.autocomplete = autocomplete;
        return this;
    }

    build() {
        if(!this.#changedName) {
            throw new Error("You cannot create a command with no name!");
            process.abort();
        }

        if(!this.#changedDescription) {
            throw new Error("You cannot create a command with no description!");
            process.abort();
        }

        if(!this.#changedRun) {
            throw new Error("You cannot create a command without a run function!");
            process.abort();
        }

        return this.#command;
    }
}

// ################
// ## INTERFACES ##
// ################
export interface command {
    interaction: {
        type?: 1 | 2 | 3;
        name: string;
        name_localizations?: { [id: string] : string};
        description: string;
        description_localizations?: {};
        options?: Array<commandOption>;
        default_member_permissions?: string;
        default_permission?: boolean;
    };
    ephemeral: boolean;
    run: (VFreeBot: VFreeBot, interaction: CommandInteraction) => Promise<any>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<any>;
}


interface commandOption {
    type: number;
    name: string;
    name_localizations?: {};
    description: string;
    description_localizations?: {};
    required?: boolean;
    choices?: Array<{
        name: string;
        name_localizations?: {};

        value: number | string;
    }>;
    options?: Array<commandOption>;
    channel_type?: {};
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
}