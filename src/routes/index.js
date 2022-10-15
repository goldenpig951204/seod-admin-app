const express = require("express");
const router = express.Router();

const { authMiddleware, adminMiddleware } = require("../middlewares");

const semrushCtrl = require("../controllers/semrushCtrl");
const spyfuCtrl = require("../controllers/spyfuCtrl");
const seolyzeCtrl = require("../controllers/seolyzeCtrl");
const sistrixCtrl = require("../controllers/sistrixCtrl");
const linkcentaurCtrl = require("../controllers/linkcentaurCtrl");
const spamzillaCtrl = require("../controllers/spamzillaCtrl");
const seodityCtrl = require("../controllers/seodityCtrl");
const proxyCtrl = require("../controllers/proxyCtrl");
const settingCtrl = require("../controllers/settingCtrl");
const siteCtrl = require("../controllers/siteCtrl");
const logCtrl = require("../controllers/logCtrl");

router.use("/authorize", authMiddleware, (req, res) => {
    res.status(301).redirect("/");
});

router.get("/api/proxies", proxyCtrl.getProxies);
router.get("/api/proxies/:id", proxyCtrl.getProxy);
router.post("/api/proxies", proxyCtrl.createProxy);
router.put("/api/proxies/:id", proxyCtrl.updateProxy);
router.delete("/api/proxies/:id", proxyCtrl.deleteProxy);

router.get("/api/setting", settingCtrl.getSetting);
router.post("/api/setting", settingCtrl.setSetting);

router.post("/api/semrush/login", semrushCtrl.login);
router.post("/api/spyfu/login", spyfuCtrl.login);
router.post("/api/seolyze/login", seolyzeCtrl.login);
router.post("/api/sistrix/login", sistrixCtrl.login);
router.post("/api/linkcentaur/login", linkcentaurCtrl.login);
router.post("/api/spamzilla/login", spamzillaCtrl.login);
router.post("/api/seodity/login", seodityCtrl.login);

router.get("/api/sites", siteCtrl.getSites);
router.get("/api/sites/:id", siteCtrl.getSite);
router.post("/api/sites", siteCtrl.createSite);
router.put("/api/sites/:id", siteCtrl.updateSite);
router.delete("/api/sites/:id", siteCtrl.deleteSite);

router.get("/api/logs", logCtrl.getLogs);

router.get("/", adminMiddleware, (req, res) => res.render("index"));

module.exports = router;
