const mongoose = require("mongoose");
const SiteSchema = mongoose.Schema({
    url: {
        type: String,
        unique: true
    },
    membershipApiKey: {
        type: String,
        required: true
    }
});

const Site = mongoose.model('site', SiteSchema);

module.exports = Site;