const { MessageEmbed } = require("discord.js");

const startupEmbeds = new MessageEmbed()
    .setColor("#0099ff")
    .setTitle("Now Playing: -")
    .setImage("https://i.redd.it/8hkekbti9a221.jpg")
    .setTimestamp()
    .setFooter("Toppiiz © 2021 อิอิ");
const startupContent = "__**Queue list:**__";

module.exports = async function getUpdatedBanner(
    queue,
    bannerId,
    currentTrack,
    tracks
) {
    const rows = (await queue.options.metadata.channel.messages.fetch(bannerId))
        .components;
    const buttons = rows[0].components;
    var editedEmbed, editedContent;
    if (!currentTrack && tracks.length == 0) {
        editedContent = startupContent;
        editedEmbed = startupEmbeds;
        buttons.forEach((button) => {
            if (button.customId !== "clear") button.setDisabled(true);
        });
    } else {
        var editedEmbed = new MessageEmbed()
            .setColor("#0099ff")
            .setTitle(
                `Now Playing${queue.loop ? "【Loop】" : ""}: **\`${
                    currentTrack.title
                }\`**`
            )
            .setImage(currentTrack.thumbnail)
            .setTimestamp()
            .setFooter("Toppiiz © 2021 อิอิ");
        var editedContent = startupContent;
        if (tracks.length > 10) {
            editedContent += `\nAnd ${tracks.length - 10} more...`;
        }
        for (
            var i = tracks.length > 10 ? 10 - 1 : tracks.length - 1;
            i >= 0;
            i--
        ) {
            editedContent += "\n" + `\`${i + 1}.\` **${tracks[i].title}**`;
        }
        buttons.forEach((button) => {
            if (button.disabled) button.setDisabled(false);
        });
    }
    return {
        content: editedContent,
        embeds: [editedEmbed],
        components: rows,
    };
};
