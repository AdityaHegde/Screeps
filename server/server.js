module.exports = function () {
  const readFileSync = require("fs").readFileSync;
  const express = require("express");
  const app = express();
  const httpServer = require("http").createServer(app);
  const bodyParser = require("body-parser");
  const PORT = 8080;

  const globSync = require("glob").sync;

  const routes = globSync("./routes/**/*.js", { cwd: __dirname }).map(require);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  routes.forEach(route => route(app));

  app.use("/", express.static(__dirname + "/assets"));

  httpsServer.listen(PORT, () => {
    console.log("Master:", "listening on port : " + PORT);
  });

  return app;
}
