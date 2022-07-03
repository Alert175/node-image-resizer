const http = require("http");
const url = require("url");
const HttpAdapter = require("../src/http");

// Prometheus
const client = require("prom-client");
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
collectDefaultMetrics({ register, prefix: "node_image_resizer__" });

const hostname = "0.0.0.0";
const port = 5002;
const urlPrefix = "/image/v2";

const server = http.createServer((req, res) => {
	const http = new HttpAdapter();
	res.setHeader("Access-Control-Allow-Origin", "*");

	const urlData = url.parse(req.url);

	switch (urlData.pathname) {
		case urlPrefix + "/optimize":
			http.optimise(req, res);
			break;

		case urlPrefix + "/metrics":
			res.setHeader("Content-Type", register.contentType);
			register
				.metrics()
				.then((data) => res.end(data))
				.catch(() => {
					res.statusCode = 404;
					res.end("not found metrics");
				});
			break;

		default:
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain");
			res.end("router not found");
			break;
	}
});

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
