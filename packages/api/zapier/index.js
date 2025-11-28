// Zapier Integration - Main Index
const authentication = require('./authentication');
const newScanTrigger = require('./triggers/newScan');
const newQRTrigger = require('./triggers/newQR');
const createQRAction = require('./creates/createQR');
const updateQRAction = require('./creates/updateQR');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  // Authentication configuration
  authentication,

  // Triggers - events that start Zaps
  triggers: {
    new_scan: newScanTrigger,
    new_qr: newQRTrigger
  },

  // Creates - actions that write data
  creates: {
    create_qr: createQRAction,
    update_qr: updateQRAction
  },

  // Searches - actions that find data (optional)
  searches: {},

  // Resources - reusable object definitions (optional)
  resources: {}
};
