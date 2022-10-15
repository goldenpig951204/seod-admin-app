const crypto = require("node:crypto");
const settingModel = require("../models/setting");
const { semrushLog } = require("../services/logger");
const { get } = require("lodash");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        let body = JSON.stringify({
            email,
            password,
            locale: "en",
            source: "semrush",
            "g-recaptcha-response": "",
            "user-agent-hash": crypto.createHash("sha1").update(email).digest("hex").substring(0, 32)
        });
        let { data } = await axios.instance.post(
            "https://www.semrush.com/sso/authorize",
            body, 
            {
                headers: {
                    "user-agent": "",
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                    "content-length": Buffer.from(body, 'utf-8')
                }
            }
        );
        if (data.user_id) {
            let cookie = axios.cookieJar.getCookieStringSync("https://www.semrush.com");
            await settingModel.findOneAndUpdate(null, { 
                semrushCookie: cookie
            }, {
                upsert: true
            });
            semrushLog.info(`Start session with ${email} successfully.`);
            res.send("Login successfully.");
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        semrushLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};