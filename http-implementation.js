const request = require("request");
const http = require("http");
const url = require("url");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === "/I/want/title" || pathname === "/I/want/title/") {
    let addresses = query.address;

    if (!addresses) {
      return sendResponse(res, [], "No addresses provided");
    }

    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    let results = [];
    let remaining = addresses.length;

    if (remaining === 0) {
      return sendResponse(res, results);
    }

    addresses.forEach((address) => {
      fetchTitle(address, (error, title) => {
        results.push({
          address,
          title: error ? "No response" : title,
        });

        if (--remaining === 0) {
          sendResponse(res, results);
        }
      });
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not found");
  }
});

function fetchTitle(address, callback) {
  if (!address?.startsWith("http")) {
    address = `http://${address}`;
  }

  request(address, (error, response, body) => {
    if (error || !response || response.statusCode !== 200) {
      return callback(error);
    }

    const match = body.match(/<title>([^<]+)<\/title>/);
    if (match) {
      callback(null, match[1]);
    } else {
      callback(new Error("No title found"));
    }
  });
}

function sendResponse(res, results, errorMsg) {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<html><head></head><body>");
  res.write("<h1>Following are the titles of given websites:</h1><ul>");

  if (errorMsg) {
    res.write(`<p>${errorMsg}</p>`);
  } else {
    results.forEach((result) => {
      res.write(
        `<li>${result.address ? result.address + " - " : ""}"${
          result.title
        }"</li>`
      );
    });
  }

  res.write("</ul></body></html>");
  res.end();
}

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
