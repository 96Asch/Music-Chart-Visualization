#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const port = process.env.PORT || 8080

function sendFile(req, res) {
    // Look for files in the base path
    var filePath = (req.url == "/") ?
        (__dirname + "/index.html") :
        (__dirname + req.url);
    // Send the file back (though unsecure with ..)
    console.log("Sending file " + filePath)
    fs.readFile(filePath, function (err,data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    })
}

http.createServer(sendFile).listen(port, function(){
    console.log("Started server on port " + port)
});
