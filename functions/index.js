const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

exports.refreshAqiCache = onSchedule("every 30 minutes", async () => {
  logger.info("AQI cache refresh placeholder", {
    service: "refresh-aqi-cache",
  });
});

exports.sendAqiAlerts = onSchedule("every 15 minutes", async () => {
  logger.info("AQI alert fanout placeholder", {
    service: "send-aqi-alerts",
  });
});
