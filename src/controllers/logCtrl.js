const fs = require("fs");
const path = require("path");

const getLogs = (req, res) => {
    try {
        let logs = [];
        fs.readdirSync(path.join(__dirname, "../public/logs/")).forEach((file, idx) => {
            if (path.extname(file) == ".log") {
                logs.push({ name: path.basename(file) });
            }
        });      
        res.json(logs);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}
module.exports = {
    getLogs
};