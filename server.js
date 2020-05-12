var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var users = [];

function servResponse(req, res) {
    var allData = "";
    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var finish = qs.parse(allData);

        if (finish["action"] == "RESET") {
          users = []
          res.end("", null, 4);
        } else if(finish["action"] == "LOGIN"){
          obj = {
            id: null,
            info: "",
            logged: false,
            color: "white"
          }
          if(users.length >= 2){
            obj.info = "Już jest zalogowanych 2 graczy"
          } else {
            if(users.includes(finish["nick"])){
              obj.info = "Już jest używany taki nick"
            } else {
              users.push(finish["nick"])
              obj.logged = true
              obj.info = "Zalogowano"
              obj.id = users.length;
              if(users.length == 1){
                obj.color = "black"
              }
            }
          }
          res.end("" + JSON.stringify(obj), null, 4);
        } else if(finish["action"] == "CHECK"){
          obj = {count: users.length}
          res.end("" + JSON.stringify(obj), null, 4);
        }
    })
}

var server = http.createServer(function (req, res) {
    console.log("Żądany adres to: ("+req.method+") " + req.url);

    switch (req.method) {
        case "GET":
            if (req.url == "/") {
              fs.readFile("static/index.html", function (error, data) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                res.end();
              })
            } else if(req.url.indexOf(".js") != -1){
              fs.readFile("static" + decodeURI(req.url), function (error, data) {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.write(data);
                res.end();
              })
            } else if(req.url.indexOf(".css") != -1){
              fs.readFile("static" + decodeURI(req.url), function (error, data) {
                res.writeHead(200, { "Content-type": "text/css" });
                res.write(data);
                res.end();
              })
            }
            break;
        case "POST":
          if (req.url == "/"){
            servResponse(req, res)
          }
            break;
    }
})

server.listen(3000, function () {
    console.log("serwer startuje na porcie 3000")
});
