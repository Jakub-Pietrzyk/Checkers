var http = require("http");
var fs = require("fs");
var qs = require("querystring");
var users = [];
var gameArray = [];
var time = 30;
var countTimeInterval = null;
var start_time = true;
var time_ended = false;
var send_twice = 0;

function timer(){
  time = 30;
  clearInterval(countTimeInterval);
  countTimeInterval = setInterval(function(){
    time--;
    if(time <= 0){
      time_ended = true;
    }
  },1000)
}

function checkWin(){
  var wons =[true,true]
  for(var i=0;i<gameArray.length;i++){
    var row = gameArray[i];
    for(var j=0;j<row.length;j++){
      if(row[j] == 1){
        wons[1] = false
      } else if(row[j] == 2){
        wons[0] = false
      }
    }
  }
  return wons
}

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
        } else if(finish["action"] == "UPDATE_ARRAY"){
          gameArray = JSON.parse(finish["array"]);
          if(start_time){
            start_time = false
            countTimeInterval = setInterval(function(){
              time--;
              if(time <= 0){
                time_ended = true;
              }
            },1000)
          }
          var wins = checkWin()
          if(wins[0]){
            res.end("BLACK_WON", null, 4);
          } else if(wins[1]){
            res.end("WHITE_WON", null, 4);
          } else {
              res.end("START_TIME", null, 4);
          }
        } else if(finish["action"] == "WAIT_MOVE"){
          obj = {
            array: gameArray,
            change_move: false,
            time: time,
            won: false
          }
          if(finish["array"] != JSON.stringify(gameArray) || time_ended){
            obj.change_move = true;
            timer();
            send_twice++;
            if(send_twice == 2){
              send_twice = 0;
              time_ended = false;
            }
          }
          var wins = checkWin()
          if(wins[0]){
            obj.won = "BLACK_WON"
          } else if(wins[1]){
            obj.won = "WHITE_WON"
          }
          res.end("" + JSON.stringify(obj),null,4)
        } else if(finish["action"] == "MY_TIME"){
          obj = {
            time: time,
            ended: false
          }
          if(time_ended){
            obj.ended = true;
            timer();
            send_twice++;
            if(send_twice == 2){
              send_twice = 0;
              time_ended = false;
            }
          }
          res.end("" + JSON.stringify(obj),null,4)
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
