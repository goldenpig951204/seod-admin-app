const settingModel = require("../models/setting");

const getSetting = async (req, res) => {
    try {
        let setting = await settingModel.findOne();
        res.json(setting);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

const setSetting = async (req, res) => {
    try {
        let setting = req.body;
        await settingModel.findOneAndUpdate(null, setting, {
            upsert: true
        });
        let result = await settingModel.findOne(setting);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

module.exports = {
    getSetting,
    setSetting
}