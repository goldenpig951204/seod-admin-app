const crypto = require("node:crypto");
const { serverLog } = require("../services/logger");
const base64 = require("base-64");

const sessionMapper = new Map();

const notFoundMiddleware = (req, res, next) => {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

const errorHandleMiddleware = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
    });
}

const decodeSess = (sess) => {
    let [signature, timeBase64, dataBase64] = sess.split("#");
    let timeBuffer = Buffer.from(timeBase64, "base64");
    let dataBuffer = Buffer.from(dataBase64, "base64");
    let data = JSON.parse(base64.decode(dataBase64));
    return {
        signature,
        timeBuffer,
        dataBuffer,
        data
    }
}

const sign = (timeSignedBuffer, dataBuffer, userAgent, ipAddr) => {
    const signature = crypto
      .createHmac("sha1", process.env.PRIVATE_KEY)
      .update(`${userAgent}\n${ipAddr}`)
      .update(timeSignedBuffer)
      .update(dataBuffer)
      .digest("base64");
    return signature;
}

const isValidSess = (sess, userAgent, ipAddr) => {
    let { timeBuffer, dataBuffer, signature } = decodeSess(sess);
    let signedResult = sign(timeBuffer, dataBuffer, userAgent, ipAddr);
    return signedResult === signature;
}

const genSess = (dataBuffer, userAgent, ipAddr) => {
    let now = new Date().getTime();
    let timeSignedBuffer = Buffer.alloc(4);
    timeSignedBuffer.writeInt32LE(parseInt(now / 1000), 0);
    let signature = sign(timeSignedBuffer, dataBuffer, userAgent, ipAddr);
    return `${signature}#${timeSignedBuffer.toString("base64")}#${dataBuffer.toString("base64")}`;
}

const getMembership = async (uid, lid, siteUrl) => {
    try {
        let site = await Site.findOne({url: siteUrl});
        serverLog.error(`Missing config for ${siteUrl}`);
        let { data } = await axios.get(`${siteUrl}/wp-content/plugins/indeed-membership-pro/apigate.php?ihch=${site.membershipApiKey}&action=verify_user_level&uid=${uid}&lid=${lid}`);
        return data.response;
    } catch (err) {
        return false;
    }
}

const isAccessable = async (uid, site) => {
    let setting = await Settings.findOne();
    let check = false;
    for(let i = 0; i < setting.membershipLids.length; i++) {
        let lid = setting.membershipLids[i];
        let result = await getMembership(uid, lid, site);
        if (result != 0) {
            check = true;
            break;
        }
    }
    return check;
}

const getMainDomain = (domain) => {
    let segments = domain.split(".");
    let mainDomain = "";
    for (let i = 0; i < segments.length; i++) {
        if (i > 0) mainDomain += "." + segments[i];
    }
    return mainDomain;
}

const authMiddleware = async (req, res, next) => {
    let domain = req.headers["host"];
    let userAgent = req.headers["user-agent"];
    let ipAddr = process.env.NODE_ENV == "development" ? "45.126.3.252" : req.headers["x-forwarded-for"];
    let { sess, site } = req.body;
    if (!sess) {
        return res.status(400).end("Bad Request, please try again.");
    }
    if (!isValidSess(sess, userAgent, ipAddr)) {
        return res.status(400).end("Session is invalid");
    }
    let { dataBuffer, data } = decodeSess(sess);
    let newSess = genSess(dataBuffer, userAgent, ipAddr);
    let user = {
        id: data[0],
        isAdmin: Number(data[3]),
        username: data[1].split("=")[1].split("|")[0],
        accessAble: Number(data[3]) ? true : await isAccessable(data[0], site)
    }
    sessionMapper.set(`${site}-${user.id}`, newSess);
    res.cookie("sess", newSess, {
        path: "/",
        domain: process.env.NODE_ENV === "development" ? undefined : getMainDomain(domain)
    });
    res.cookie("wpInfo", base64.encode(JSON.stringify({user, site})), {
        path: "/",
        domain: process.env.NODE_ENV === "development" ? undefined : getMainDomain(domain)
    });
    next();
}

const adminMiddleware = (req, res, next) => {
    let { wpInfo, sess } = req.cookies;
    if (!wpInfo || !sess) return res.status(400).end('Access Denied.');
    let userAgent = req.headers['user-agent'];
    let ipAddr = process.env.NODE_ENV == "development" ? "45.126.3.252" : req.headers['x-forwarded-for'];

    if (!isValidSess(sess, userAgent, ipAddr)) return res.status(400).end('Session is invalid.');
    
    let wpInfoDecoded = JSON.parse(base64.decode(wpInfo));
    if (!wpInfoDecoded.user.isAdmin) return res.status(400).end('Restricted Access.');
    if (!sessionMapper.get(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`)) sessionMapper.set(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`, sess);
    // if (sessionMapper.get(`${wpInfoDecoded.site}-${wpInfoDecoded.user.id}`) !== sess) return res.status(400).end('Multiple Browsers is not allowed.');
    next();
}

module.exports = {
    notFoundMiddleware,
    errorHandleMiddleware,
    authMiddleware,
    adminMiddleware
}