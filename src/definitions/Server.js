module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "server",
        {
            server_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            server_name: DataTypes.STRING,
            // channel: {
            //     type: DataTypes.STRING,
            //     defaultValue: null,
            // },
        },
        {
            timestamps: false,
        }
    );
};
