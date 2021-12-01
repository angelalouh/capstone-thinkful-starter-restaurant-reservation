const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  res.json({
    data: await service.list(),
  });
}

module.exports = {
  list: asyncErrorBoundary(list),
};
