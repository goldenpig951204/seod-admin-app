const crypto = require("node:crypto");
const settingModel = require("../models/setting");
const { linkcentaurLog } = require("../services/logger");
const { get } = require("lodash");
const dvAxios = require("devergroup-request").default;
const parseHTML = require("jquery-html-parser");

const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { email, password } = req.body;

    try {
        let response = await axios.instance.get("https://www.linkcentaur.com/users/sign_in");
        let $ = parseHTML(response.data);
        let utf8 = $("#new_user [name='utf8']").val();
        let authenticity_token = $("#new_user [name='authenticity_token']").val();
        let commit = "Sign in";
        let body = JSON.stringify({
            utf8,
            authenticity_token,
            commit,
            user: {
                email,
                password,
                remember_me: 0
            }
        });
        response = await axios.instance.post(
            "https://www.linkcentaur.com/users/sign_in",
            body, 
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                    "Content-Type": "application/json; charset=UTF-8",
                    "Content-Length": Buffer.from(body, 'utf-8'),
                    "Origin": "https://www.linkcentaur.com"
                }
            }
        );
        if (response.request.path == "/") {
            let cookie = axios.cookieJar.getCookieStringSync("https://www.linkcentaur.com");
            await settingModel.findOneAndUpdate(null, {
                linkcentaurCookie: cookie
            }, {
                upsert: true
            });
            linkcentaurLog.info(`Start session with ${email} successfully.`);
            res.send("Login successfully.");
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        linkcentaurLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};