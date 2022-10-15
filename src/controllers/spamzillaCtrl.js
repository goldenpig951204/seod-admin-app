// const crypto = require("node:crypto");
const settingModel = require("../models/setting");
const credentialModel = require("../models/credential");
const { spamzillaLog } = require("../services/logger");
const { get } = require("lodash");
const dvAxios = require("devergroup-request").default;
const puppeteer = require("puppeteer-extra");
// const parseHTML = require("jquery-html-parser");

// const axios = new dvAxios({
//     axiosOpt: {
//         timeout: 100000
//     }
// });

const login = async (req, res) => {
    let { email, password } = req.body;
    try {
        // let response = await axios.instance.get("https://www.spamzilla.io/account/login/");
        // let $ = parseHTML(response.data);
        // let token = $("meta[name='csrf-token']").attr("content");
        // let body = `_t=${token}&LoginForm[email]=${email}&LoginForm[password]=${password}&LoginForm[rememberMe]=1&ajax=login-form`;
        // let { data } = await axios.instance.post(
        //     "https://www.spamzilla.io/account/login/", 
        //     body,
        //     {
        //         headers: {
        //             "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        //             "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        //             "content-length": Buffer.byteLength(body),
        //             "x-requested-with": "XMLHttpRequest",
        //         }
        //     }
        // );
        // if (Array.isArray(data) && !data.length) {
        //     response = await axios.instance.get("https://www.spamzilla.io/account/login/");
        //     console.log(response)
        //     // console.log("OK");
        //     //     let cookie = axios.cookieJar.getCookieStringSync("https://www.spamzilla.io/domains");
        //     //     console.log(cookie);
        //     //     res.end("OK");
        //     // }, 10000);
        // }
        const windowsLikePathRegExp = /[a-z]:\\/i;
        let inProduction = false;

        if (! windowsLikePathRegExp.test(__dirname)) {
            inProduction = true;
        }
        let options = {};
        if (inProduction) {
            options = {
                headless : true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--media-cache-size=0',
                    '--disk-cache-size=0',
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
                timeout: 100000,
            };
        } else {
            options = {
                headless : false,
                timeout: 100000,
                args: [
                    '--ignore-certificate-errors',
                    '--ignore-certificate-errors-spki-list',
                ],
            };
        }
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        await page.goto('https://www.spamzilla.io/account/login/', {waitUntil: 'load', timeout: 100000});
        await page.focus("#loginform-email").then(async () => {
            await page.keyboard.type(email, { delpay: 100 });
        });
        await page.focus("#loginform-password").then(async () => {
            await page.keyboard.type(password, { delpay: 100 });
        });
        await Promise.all([
            page.waitForNavigation({waitUntil: 'load', timeout : 100000}),
            page.click('.custom-submit-btn')
        ]).then(async (result) => {
            if (/account\/login/.test(page.url())) {
                await browser.close(true);
                spamzillaLog.error(`Start session with ${email} failed.`);
                res.status(500).send("Credential is incorrect.");
            } else {
                let cookies = await page.cookies();
                await browser.close(true);
                let cookie = "";
                for( let idx in cookies) {
                    cookie += cookies[idx].name + "=" + cookies[idx].value + "; ";
                }
                await credentialModel.findOneAndUpdate(null, {
                    type: "spamzilla",
                    username: email,
                    password: password
                }, {
                    upsert: true
                });
                await settingModel.findOneAndUpdate(null, {
                    spamzillaCookie: cookie
                }, {
                    upsert: true
                });
                spamzillaLog.info(`Start session with ${email} successfully.`);
                res.send('Login successfully.');
            }
        });
    } catch (err) {
        spamzillaLog.error(`Start session with ${email} failed: ${get(err, "response.data.message") || err.toString()}`);
        res.status(500).send(get(err, "response.data.message") || err.toString());
    }
}

module.exports = {
    login
};