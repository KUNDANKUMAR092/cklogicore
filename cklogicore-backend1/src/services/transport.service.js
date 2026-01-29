const Transport = require("../models/transport.model");

exports.create = data => Transport.create(data);
exports.list = q => Transport.find(q).sort({ createdAt: -1 });
