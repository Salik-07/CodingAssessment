const axios = require("axios");
const http = require("http");
const url = require("url");

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  if (pathname === "/I/want/title" || pathname === "/I/want/title/") {
    let addresses = query.address;

    if (!addresses) {
      return sendResponse(res, [], "No address provided");
    }

    if (!Array.isArray(addresses)) {
      addresses = [addresses];
    }

    try {
      const results = await Promise.all(
        addresses.map((address) => fetchTitle(address))
      );

      sendResponse(res, results);
    } catch (error) {
      sendResponse(res, [], "Error occurred while fetching titles");
    }
  } else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>404 Not found</h1>");
  }
});

async function fetchTitle(address) {
  if (!address?.startsWith("http")) {
    address = `http://${address}`;
  }

  try {
    const response = await axios.get(address);
    const match = response.data.match(/<title>([^<]+)<\/title>/);

    return {
      address,
      title: match && match.length > 0 ? match[1] : "No title found",
    };
  } catch (error) {
    return { address, title: "No response" };
  }
}

function sendResponse(res, results, errorMsg = null) {
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
