/*
    * Koko
    * May 12, 2025
*/

import { CommandInteraction, EmbedBuilder } from "discord.js";
import { commandBuilder, VFreeBot } from "../bot";

export default new commandBuilder().setName("about").setDescription("About VFree!").setRunFunction(async (VFreeBot: VFreeBot, interaction: CommandInteraction) => {
  const AVATAR = VFreeBot.CLIENT.user?.avatarURL();
  if (!AVATAR) return interaction.followUp("Failed to get AvatarURL!\nPlease report this to kokovt_");

  const DESCRIPTION_TEXT = `
Be Free! Be You!
VFree is a VTuber agency that has no auditions, no schedule requirements, no contracts! Anyone can join! All you need to be is:
* 16+
* A current or upcoming PNGTuber or VTuber
That's it! You can join simply by adding "VFree" to your name/bio, and you can leave just as easily! We would love to have new members!`

  const IMAGE_URL = "https://cdn.discordapp.com/attachments/1369492663530946630/1369493167962980412/vfree_logo_square.png?ex=6822a6e7&is=68215567&hm=90bef01189793918299c13b07a7c02c1b342f3a07990ae75d0dad65931378cec&";

  const EMBED = new EmbedBuilder().setAuthor({
    name: "VFree",
    iconURL: AVATAR,
    url: "https://vfree.xyz"
  }).setDescription(DESCRIPTION_TEXT).setImage(IMAGE_URL).setFooter({
    text: "Developed by Koko from kokofee!"
  }).setFooter({
    text: "Developed by Koko from kokofee!"
  });

  interaction.followUp({ embeds: [EMBED], content: "About VFree" });
}).setEphemeral(true).build();
