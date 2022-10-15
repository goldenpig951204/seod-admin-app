const e = require("express");
const proxyModel = require("../models/proxy");
const getProxies = async (req, res) => {
    try {
        let proxies = await proxyModel.find();
        res.json(proxies);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

const getProxy = async (req, res) => {
    try {
        let { id } = req.params;
        let proxy = await proxyModel.findById(id);
        res.json(proxy);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

const createProxy = async (req, res) => {
    try {
        let proxy = req.body;
        let result = await proxyModel.create(proxy);
        res.json(result);
    } catch (err) {
        if (err.code == 11000) {
            res.status(500).send("You can create only one domain per type.");
        } else {
            res.status(500).send(err.toString());
        }
    }
}

const updateProxy = async (req, res) => {
    try {
        let { id } = req.params;
        let proxy = req.body;
        let result = await proxyModel.findByIdAndUpdate(id, proxy);
        res.json(result);
    } catch (err) {
        if (err.codeName == "DuplicateKey") {
            res.status(500).send("You can create only one domain per type.");
        } else {
            res.status(500).send(err.toString());
        }
    }
}

const deleteProxy = async (req, res) => {
    try {
        let { id } = req.params;
        let result = await proxyModel.findByIdAndDelete(id);
        res.json(result);
    } catch (err) {
        res.status(500).send(err.toString());
    }
}

module.exports = {
    getProxies,
    getProxy,
    createProxy,
    updateProxy,
    deleteProxy
}