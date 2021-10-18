const Sequelize = require("sequelize");

const sequelize = new Sequelize("sqlite:./db/server.db", {
    logging: false,
});

const Server = require("./definitions/Server")(sequelize, Sequelize.DataTypes);
const Channel = require("./definitions/Channel")(
    sequelize,
    Sequelize.DataTypes
);

Channel.belongsTo(Server, { foreignKey: "server_fk", as: "server_id" });

module.exports = { Server, Channel };
