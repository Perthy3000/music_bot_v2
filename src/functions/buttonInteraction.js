function resumePause(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) {
        return;
    }
    let embed = interaction.message.embeds[0];
    let title = embed.title;
    let paused = queue.setPaused();
    title = paused
        ? title.replace("Now Playing", "【Paused】")
        : title.replace("【Paused】", "Now Playing");
    embed.setTitle(title);
    interaction.update({ embeds: [embed] });
}

function skip(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) {
        return;
    }
    queue.skip();
    interaction.update({});
}

function stop(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) {
        return;
    }
    queue.stop();
    interaction.update({});
}

function loop(interaction, client) {
    let queue = client.player.getQueue(interaction.guildId);
    if (!queue) {
        return;
    }
    let embed = interaction.message.embeds[0];
    let title = embed.title;
    let loop = queue.setLoop();
    if (loop) {
        title = title.replace("Now Playing", "Now Playing【Loop】");
    } else {
        title = title.replace("Now Playing【Loop】", "Now Playing");
    }
    embed.setTitle(title);
    interaction.update({ embeds: [embed] });
}

module.exports = { resumePause, skip, stop, loop };
