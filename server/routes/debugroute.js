const express = require("express");
const { createDebug, history,getDebugById,deleteHistoryItem,clearAllHistory} = require("../controllers/debugController");

const router = express.Router();

router.post("/debug", createDebug);
router.get("/history", history);
router.get("/debug/:id", getDebugById);
router.delete("/history/:id", deleteHistoryItem);
router.delete("/history", clearAllHistory);
module.exports = router;