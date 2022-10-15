const { get } = require("lodash");
const settingModel = require("../models/setting");
const { spyfuLog } = require("../services/logger");
const dvAxios = require("devergroup-request").default;
const axios = new dvAxios({
    axiosOpt: {
        timeout: 30000
    }
});

const login = async (req, res) => {
    let { username, password } = req.body;
    try {
        let body = {
            username,
            password,
            rememberMe: false,
            source: "LoginPage",
            token: "03AIIukzg2cJaTcrMEK4tXZrjb18q3XdxrJ30OdPe5m5tnh9dsJN4ksSqqLbWEiuHI1w5_cZ8lHEM2ZU0MYwPPmEaFp-aCgebE0v6A8HKE9sBJJKE71NIuuSXAtBf8L0mDLg6nuk_EbyE_PhkGuKRM6N_iJeYby4oE2_daxspzpIas5LeM6MTRTvoHJ5GDrLTinNDHauyxtDOdV_14tCiK3ZU1MLWI-eUm3VjqIXSwd5ADJoa86EjygARBzUsZTWEcnBBIiIXDaYLCVWLCzZI06kSrKt1BBzEVX6uMbxy_kXEvc-FC-IbiA6eymOVN1OrNYFIGi1mDWrAb9btuVFLWUN1nMeQc0UNPNs68FegSlib-87e7JPnhAtvuUqi00AmiGOZN0qeSNTID6FzvSmt9_ivzGSe2Oc7QAGcXgmqapgkbaIfvdAMvrhWA7-Mp0bmsjy8KSv1dldknBX3RLiyAb9FaqMJkUzIItQ0NQRd4vK7fs0EQuZidZvm6X1HM37pzrWv96R0SveNc"
        }
        let { data } = await axios.instance.post(
            "https://www.spyfu.com/auth/login",
            JSON.stringify(body),
            {
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                    "content-length": Buffer.from(JSON.stringify(body), "utf-8")
                }
            }
        );
        if (data.isSuccessful) {
            if (data.clientState.user.isLoggedIn) {
                let cookie = axios.cookieJar.getCookieStringSync("https://www.spyfu.com");
                await settingModel.findOneAndUpdate(null, {
                    spyfuCookie: cookie
                }, {
                    upsert: true
                });
                spyfuLog.info(`Start session with ${username} successfully.`);
                res.send("Login successfully.");
            } else {
                login(req, res);
            }
        } else {
            res.status(500).send("Credential is incorrect.");
        }
    } catch (err) {
        spyfuLog.error(`Start session with ${username} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};