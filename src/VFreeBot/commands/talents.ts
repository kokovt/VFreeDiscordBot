import { EmbedBuilder, EmbedField } from "discord.js";
import { commandBuilder, commandOptionTypes, optionBuilder } from "../bot";

const HOURS_IN_MS = 3_600_000;

const TALENT_DATA: {
  [id: string]: {
    streamer_name: string,
    translation?: string,
    header_text?: string,
    description: string,
    links?: Array<{
      name: string,
      link: string
    }>,
    model_images: Array<string>,
    schedule?: Array<{
      day: Date,
      length: number,
      reoccuring: boolean,
    }>,
    discord_image_index: number
  }
} = {
  kokofee_: {
    streamer_name: "kokofee_",
    translation: "ここふぇえ",
    header_text: "The coffee brewing trio",
    description: "Hello, we are Kokofee!\nKokofee is the collaboration VTuber channel between our three talents, Koko, Toffee, and Tango!\nWe are a trio that just likes hanging out, and doing stupid things in video games!\nIf we are ever streaming, feel free to join!",
    links: [{
      name: "youtube",
      link: "https://twitch.tv/kokofee_"
    }, {
      name: "twitch",
      link: "https://www.youtube.com/@kokofeetv"
    }],
    model_images: ["https://cdn.discordapp.com/attachments/1369568824533323807/1369954553071669319/Screenshot_2025-05-08_022939.png?ex=6824fd59&is=6823abd9&hm=71e630d852b2ec9866d32e64108238497f3f6b1a4c26111605f70e19215be269&"],
    schedule: [
      {
        day: new Date(2025, 4, 14, 10, 0, 0),
        length: 3 * HOURS_IN_MS, // 3 hours,
        reoccuring: true
      }, {
        day: new Date(2025, 4, 17),
        length: 0,
        reoccuring: true
      }, {
        day: new Date(2025, 4, 18),
        length: 0,
        reoccuring: true
      }
    ],
    discord_image_index: 0
  }
}

// For now all of the talents are hard-coded. 
// I will add the ability to add a user when I make the website
export default new commandBuilder().setName("talents").setDescription("Get information on a talent").setOptions([
  new optionBuilder().setName("talent_name").setDescription("Name of the talent you want info on!").setType(commandOptionTypes.STRING).setAutocomplete().setRequired().build()
]).setAutocompleteFunction(async (interaction) => {
  const focusedValue = interaction.options.getFocused();
  const talents = ["kokofee_"];

  const filtered = talents.filter(choice => choice.startsWith(focusedValue));
  await interaction.respond(
    filtered.map(choice => ({ name: choice, value: choice }))
  );

}).setRunFunction(async (VFreeBot, interaction) => {
  const AVATAR = VFreeBot.CLIENT.user?.avatarURL();
  const TALENT_NAME = String(interaction.options.get("talent_name", true).value);

  if (!AVATAR) return interaction.followUp("Failed to get AvatarURL!\nPlease report this to kokovt_!");
  if (!TALENT_NAME) return interaction.followUp("Failed to get Talents name!\nPlease make sure you input one, or if you did report this to kokovt_!");
  if (!TALENT_DATA[TALENT_NAME]) return interaction.followUp("Failed to find the talent in the database!");
  const TALENTS_INFO = TALENT_DATA[TALENT_NAME];

  let talents_schedule_text = "This talent doesn't have anything scheduled!";

  if (TALENTS_INFO.schedule) {
    talents_schedule_text = "";
    for (let i = 0; i < TALENTS_INFO.schedule.length; i++) {

      talents_schedule_text += format_date(TALENTS_INFO.schedule[i].day, TALENTS_INFO.schedule[i].reoccuring, TALENTS_INFO.schedule[i].length);
    }

    talents_schedule_text += "-# All times are shown in MST";
  }

  let link_fields: Array<EmbedField> = [];

  if (TALENTS_INFO.links) {
    for (let i = 0; i < 3; i++) {
      if (!TALENTS_INFO.links[i]) break;
      link_fields.push({
        name: TALENTS_INFO.links[i].name,
        value: TALENTS_INFO.links[i].link,
        inline: true
      });
    }
  }

  const EMBED = new EmbedBuilder().setAuthor({
    name: "VFree",
    iconURL: AVATAR,
    url: "https://vfree.xyz"
  }).setTitle(TALENTS_INFO.streamer_name).setImage(TALENTS_INFO.model_images[TALENTS_INFO.discord_image_index])
    .setDescription(`${TALENTS_INFO.translation ? "### " + TALENTS_INFO.translation + "\n" : ""}**${TALENTS_INFO.header_text ? TALENTS_INFO.header_text + "\n" : ""}** ${TALENTS_INFO.description}`)
    .addFields({
      name: "Schedule",
      value: talents_schedule_text
    }).addFields(link_fields).setFooter({
      text: "Developed by Koko from kokofee!"
    });

  interaction.followUp({ embeds: [EMBED] });
}).build();

// These are out here so javascript doesn't constantly reallocate
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AM_PM: { [id: string]: string } = {
  am: "pm",
  pm: "am"
}

function format_date(date_value: Date, reoccuring: boolean, length: number) {
  const END_DATE = new Date(date_value.getTime() + length);
  return `${reoccuringFormat(date_value, reoccuring)} at ${date_value.getHours()}:${padNumber(date_value.getMinutes())} until ${reoccuringFormat(END_DATE, reoccuring)} ${END_DATE.getHours()}:${padNumber(END_DATE.getMinutes())}\n`;
}

function reoccuringFormat(date_value: Date, reoccuring: boolean) {
  return reoccuring ? `${DAYS[date_value.getDay()]}s` : DAYS[date_value.getDay()]
}

function padNumber(number: number) {
  if (number >= 10) return number;
  return '0' + number;
}
