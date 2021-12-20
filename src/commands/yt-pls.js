const fetch = require("node-fetch");

module.exports = {
    name: "yt-pls",
    description: "",
    async execute(message, args, client) {
        const guildMember = await message.guild.members.fetch(
            message.author.id
        );
        const channel = guildMember.voice.channel;
        if (!channel)
            return message.reply("You are not connected to voice channel");

        fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
            method: "POST",
            body: JSON.stringify({
                max_age: 86400,
                max_uses: 0,
                target_application_id: "880218394199220334",
                target_type: 2,
                temporary: false,
                validate: null,
            }),
            headers: {
                Authorization: `Bot ${client.token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((invite) => {
                if (!invite.code)
                    return message.channel.send("Starting YT together failed");
                message.channel.send(
                    `https://discord.com/invite/${invite.code}`
                );
            });
    },
};
