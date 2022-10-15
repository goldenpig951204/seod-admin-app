const crypto = require("node:crypto");
const settingModel = require("../models/setting");
const { sistrixLog } = require("../services/logger");
const { get } = require("lodash");
const dvAxios = require("devergroup-request").default;
const parseHTML = require("jquery-html-parser");
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { name, password } = req.body;
    try {
        let response = await axios.instance.get("https://app.sistrix.com/login");
        let $ = parseHTML(response.data);
        var skey = $("#login-form > input[name='skey']").val();
        var credential_redirect_link = $("#login-form > input[name='credential_redirect_link']").val();
        var login_check = $("#login-form > input[name='login_check']").val();
        let body = `otp-capable=1&credential_redirect_link=${credential_redirect_link}&skey=${skey}&login_check=${login_check}&name=${name}&password=${password}`;
        response = await axios.instance.post(
            "https://app.sistrix.com/login",
            body,
            {
                headers: {
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(body),
                }
            }
        );
        if (typeof response.config == "object" && response.config.url == "https://app.sistrix.com/sistrix/profile_select") {
            let cookie = axios.cookieJar.getCookieStringSync("https://app.sistrix.com");
            await settingModel.findOneAndUpdate(null, { 
                sistrixCookie: cookie
            }, {
                upsert: true
            });
            sistrixLog.info(`Start session with ${name} successfully.`);
            res.send("Login successfully.");
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        sistrixLog.error(`Start session with ${name} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};