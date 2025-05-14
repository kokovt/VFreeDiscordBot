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

      if (interaction.isAutocomplete()) {
        let autocomplete_interaction: AutocompleteInteraction = interaction;

        for (let i = 0; i < this.commands.length; i++) {
          if (interaction_check(this.commands[i].interaction.name, interaction)) continue;

          await this.commands[i].autocomplete?.(autocomplete_interaction);
        }
      }

      if (!interaction.isCommand()) return;

      for (let i = 0; i < this.commands.length; i++) {
        if (interaction_check(this.commands[i].interaction.name, interaction)) continue;

        try {
          if (this.commands[i].ephemeral == true) {
            await interaction.deferReply({
              flags: MessageFlags.Ephemeral // emphemeral: true was good enough. This is more complicated than needed.
            });
          } else {
            await interaction.deferReply();
          }

          await this.commands[i].run(this, interaction);
          return;
        } catch (err: any) { // For some reason you cant say the error is of type "Error"
          console.error(err.message);
          interaction.followUp({ flags: MessageFlags.Ephemeral, content: "Error running command!" });
        }
      }

      interaction.reply({ flags: MessageFlags.Ephemeral, content: "Coulnd't find command!" });
    });
  }

  async #registerCommands() {
    const FILES = await glob(`${process.cwd().replaceAll("\\", "/")}/dist/VFreeBot/commands/**/*.js`); // Replace the backslashes with forwardslashes for windows users. Wierd edgecase.

    for (let i = 0; i < FILES.length; i++) {
      const COMMAND: any = require(FILES[i]).default;

      if (!COMMAND.interaction.name) continue;

      this.commands.push(COMMAND);

      if (this.CLIENT.isReady()) {
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
      async run(VFreeBot, interaction) { }
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

  setNameLocalizations(localizations: { [id: string]: string }) {
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

  setRunFunction(run: (VFreeBot: VFreeBot, interaction: CommandInteraction) => Promise<any>) {
    this.#changedRun = true;
    this.#command.run = run;
    return this;
  }

  setAutocompleteFunction(autocomplete: (interaction: AutocompleteInteraction) => Promise<any>) {
    this.#command.autocomplete = autocomplete;
    return this;
  }

  build() {
    if (!this.#changedName) {
      throw new Error("You cannot create a command with no name!");
      process.abort();
    }

    if (!this.#changedDescription) {
      throw new Error("You cannot create a command with no description!");
      process.abort();
    }

    if (!this.#changedRun) {
      throw new Error("You cannot create a command without a run function!");
      process.abort();
    }

    return this.#command;
  }
}


export class optionBuilder {
  #options: commandOption;
  #changedName: boolean;
  #changedDescription: boolean;
  #changedType: boolean;
  constructor() {
    this.#changedName = false;
    this.#changedDescription = false;
    this.#changedType = false;
    this.#options = {
      type: commandOptionTypes.STRING,
      name: "placeholder",
      description: "placeholder"
    }
  }

  setType(type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | number) {
    this.#changedType = true;
    this.#options.type = type;
    return this;
  }

  setName(name: string) {
    this.#changedName = true;
    this.#options.name = name;
    return this;
  }

  setNameLocalizations(name_localizations: { [id: string]: string }) {
    this.#options.name_localizations = name_localizations;
    return this;
  }

  setDescription(description: string) {
    this.#changedDescription = true;
    this.#options.description = description;
    return this;
  }

  setDescriptionLocalizations(description_localizations: { [id: string]: string }) {
    this.#options.description_localizations = description_localizations;
    return this;
  }

  //! This one assumes true, since discord always assumes no, unless told.
  setRequired(required: boolean = true) {
    this.#options.required = required;
    return this;
  }

  setChoices(choices: Array<{
    name: string;
    name_localizations?: { [id: string]: string };
    value: number | string;
  }>) {
    this.#options.choices = choices;
    return this;
  }

  setOptions(options: Array<commandOption>) {
    this.#options.options = options;
    return this;
  }

  setChannelType(channel_type: { [id: string]: string }) {
    this.#options.channel_type = channel_type;
    return this;
  }

  setMinValue(min_value: number) {
    this.#options.min_value = min_value;
    return this;
  }

  setMaxValue(max_value: number) {
    this.#options.max_value = max_value;
    return this;
  }

  setMinLength(min_length: number) {
    this.#options.min_length = min_length;
    return this;
  }

  setMaxLength(max_length: number) {
    this.#options.max_length = max_length;
    return this;
  }

  // This defaults to true since discord assumes not.
  setAutocomplete(autocomplete: boolean = true) {
    this.#options.autocomplete = autocomplete;
    return this;
  }

  build() {
    if (!this.#changedName) {
      console.error("The name was never changed!");
      process.abort();
    }
    if (!this.#changedDescription) {
      console.error("The description was never changed!");
      process.abort();
    }
    if (!this.#changedType) {
      console.error("The type was never changed!");
      process.abort();
    }

    return this.#options;
  }
}

export class choiceBuilder {
  #choice: {
    name: string;
    name_localizations?: { [id: string]: string };
    value: number | string
  };

  #changedName: boolean;
  #changedValue: boolean;
  constructor() {
    this.#changedName = false;
    this.#changedValue = false;
    this.#choice = {
      name: "placeholder",
      value: "placeholder"
    }
  };


  setName(name: string) {
    this.#changedName = true;
    this.#choice.name = name;
    return this;
  }

  setValue(value: string) {
    this.#changedValue = true;
    this.#choice.value = value;
    return this;
  }

  setNameLocalizations(name_localizations: { [id: string]: string }) {
    this.#choice.name_localizations = name_localizations;
    return this;
  }

  build() {
    if (!this.#changedName) {
      console.error("Choice name was never changed!");
      process.abort();
    }

    if (!this.#changedValue) {
      console.error("Choice value was never changed!");
      process.abort();
    }

    return this.#choice;
  }
}


// ################
// ## INTERFACES ##
// ################
export interface command {
  interaction: {
    type?: 1 | 2 | 3;
    name: string;
    name_localizations?: { [id: string]: string };
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
  name_localizations?: { [id: string]: string };
  description: string;
  description_localizations?: { [id: string]: string };
  required?: boolean;
  choices?: Array<{
    name: string;
    name_localizations?: { [id: string]: string };

    value: number | string;
  }>;
  options?: Array<commandOption>;
  channel_type?: { [id: string]: string };
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
  autocomplete?: boolean;
}


export const commandOptionTypes = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
  MENTIONABLE: 9,
  NUMBER: 10,
  ATTATCHMENTS: 11
}
