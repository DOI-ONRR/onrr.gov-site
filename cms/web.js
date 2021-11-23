const http = require('http');
const os = require('os');
const port = process.env.PORT || 8055;

http.createServer( (req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(`ONRR Directus CMS Test App on port ${port} from container ${os.hostname()}`);
}).listen(port, () => {
  console.log("Listening on " + port);
});