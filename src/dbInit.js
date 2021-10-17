const Sequelize = require("sequelize");

const sequelize = new Sequelize("sqlite:./db/server.db", {
    logging: false,
});

require("./definitions/Server")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");
const alter = process.argv.includes("--alter") || process.argv.includes("-a");

sequelize
    .sync({ force, alter })
    .then(() => {
        console.log("synced");
        sequelize.close();
    })
    .catch(console.error);
