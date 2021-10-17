const Sequelize = require("sequelize");

const sequelize = new Sequelize("sqlite:./db/server.db", {
    logging: false,
});

const Server = require("./definitions/Server")(sequelize, Sequelize.DataTypes);

module.exports = { Server };
