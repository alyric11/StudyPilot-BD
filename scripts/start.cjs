// Set production mode consistently on Windows and hosted Linux servers.
process.env.NODE_ENV = "production";
require("../dist/server.cjs");
