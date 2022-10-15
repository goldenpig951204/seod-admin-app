const crypto = require("node:crypto");
const settingModel = require("../models/setting");
const { seolyzeLog } = require("../services/logger");
const { get } = require("lodash");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { username, password } = req.body;
    try {
        let body = `username=${username}&password=${password}&stay_logged=1`;
        let { data } = await axios.instance.post(
            "https://www.seolyze.com/php_bin/security/login.php",
            body, 
            {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'content-length': Buffer.byteLength(body),
                    'referer': 'https://www.seolyze.com/en',
                    'x-requested-with': 'XMLHttpRequest',
                }
            }
        );
        if (typeof data.action !== "undefined") {
            let cookie = axios.cookieJar.getCookieStringSync("https://www.seolyze.com");
            cookie +=   "; langCookie=en";
            await settingModel.findOneAndUpdate(null, { 
                seolyzeCookie: cookie 
            }, {
                upsert: true
            });
            seolyzeLog.info(`Start session with ${username} successfully.`);
            res.send("Login successfully.");
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        seolyzeLog.error(`Start session with ${username} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};