const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");

const sequelize = new Sequelize("sqlite:./server.db", {
    logging: false,
});

const dbFiles = fs
    .readdirSync(path.join(__dirname, "/definitions"))
    .filter((file) => file.endsWith(".js"));
for (const file of dbFiles) {
    require(`./definitions/${file}`)(sequelize, Sequelize.DataTypes);
}

const force = process.argv.includes("--force") || process.argv.includes("-f");
const alter = process.argv.includes("--alter") || process.argv.includes("-a");

sequelize
    .sync({ force, alter })
    .then(() => {
        console.log("synced");
        sequelize.close();
    })
    .catch(console.error);
