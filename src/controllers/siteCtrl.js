const siteModel = require("../models/site");

const getSites = async (req, res) => {
    try {
        let sites = await siteModel.find();
        res.json(sites);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}
const getSite = async (req, res) => {
    try {
        let { id } = req.params;
        let site = await siteModel.findById(id);
        res.json(site);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}
const createSite = async (req, res) => {
    try {
        let site = req.body;
        let result = await siteModel.create(site);
        res.json(result); 
    } catch (err) {
        res.status(500).send(err.toString());
    }
}
const updateSite = async (req, res) => {
    try {
        let { id } = req.params;
        let site = req.body;
        let result = await siteModel.findByIdAndUpdate(id, site);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}
const deleteSite = async (req, res) => {
    try {
        let { id } = req.params;
        let result = await siteModel.findByIdAndDelete(id);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

module.exports = {
    getSites,
    getSite,
    createSite,
    updateSite,
    deleteSite
};