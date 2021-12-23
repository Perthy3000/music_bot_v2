const getUpdatedBanner = require("./updateBanner");

module.exports = async function registerEvent(player) {
    player.on("trackUpdate", (queue) => {
        const [currentSong, ...tracks] = queue.tracks;
        getUpdatedBanner(
            queue,
            queue.options.metadata.bannerId,
            currentSong,
            tracks
        ).then((updatedBanner) => {
            queue.options.metadata.channel.messages.edit(
                queue.options.metadata.bannerId,
                updatedBanner
            );
        });
    });
};
