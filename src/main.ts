import Brain from "src/Brain";
import { Logger } from "src/Logger";

let logger = new Logger("Main");

module.exports.loop = function () {
  logger.log(`----------------------New Loop${Game.time}----------------------`);
  (new Brain("brain")).tick();
  logger.log(`----------------------End Loop${Game.time}----------------------`);
};
