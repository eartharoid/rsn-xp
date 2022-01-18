module.exports.calcLevel = points => Math.floor(0.1 * Math.sqrt(points));
module.exports.formatTime = mins => mins > 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;