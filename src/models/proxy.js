const mongoose = require("mongoose");

const ProxySchema = mongoose.Schema({
    domain: {
        type: String,
        unique: true
    },
    type: {
        type: String,
        required: true,
        unique: true
    }
});

const Proxy = mongoose.model('proxy', ProxySchema);

module.exports = Proxy;