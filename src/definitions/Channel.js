module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "channel",
        {
            server_fk: {
                type: DataTypes.STRING,
                references: {
                    model: "servers",
                    key: "server_id",
                },
                primaryKey: true,
            },
            channel_id: DataTypes.STRING,
            channel_name: DataTypes.STRING,
            message_id: DataTypes.STRING,
        },
        {
            timestamps: false,
        }
    );
};
