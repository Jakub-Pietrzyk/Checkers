console.log("wczytano plik Net.js")
class Net {
    constructor() {
        console.log("konstruktor klasy Net");
        this.logged = false;
        this.nick = "";
        this.player_color = "";
        this.enemy_color = "";
    }

    createFlash(text=""){
      $(".flash").remove();
      var div = $("<div class='flash'>" + text + "</div>");
      var x = $("<span class='remove-flash'>X</span>");
      x.appendTo(div);
      div.appendTo($("body"));
      ui.removeFlashBtn();
      window.setTimeout(function(){
        if($(".flash ")) $(".flash").remove();
      }, 10000, true);
    }

    resetUsers(){
      $.ajax({
          url: '/',
          data: {
              action: "RESET"
          },
          type: 'POST',
          success: function (response) {
            // var data = JSON.parse(response)
          },
          error: function (xhr, status, error) {
              // console.log(xhr);
          },
      })
    }

    loginUser(){
      var instance = this;
      $.ajax({
        url: '/',
        data: {
          action: "LOGIN",
          nick: instance.nick
        },
        type: "POST",
        success: function (response) {
          var data = JSON.parse(response);
          instance.createFlash(data["info"]);
          if(data["logged"]){
            game.addUser(data["color"]);
            instance.logged = true;
            instance.player_color = data["color"];
            if(data["color"] == "white") instance.enemy_color = "black";
            if(data["color"] == "black") instance.enemy_color = "white";
            if(data["id"] == 1){
              var div = $("<div class='block-page'>Waiting for second player to join</div>")
              div.appendTo($("body"))
              ui.block_clicks = true;
              var dots = "";
              var checkingPlayersInterval = setInterval(function() {
                dots += ".";
                if(dots.length > 3) dots = ""
                $(".block-page").html("Waiting for second player to join" + dots)
                $.ajax({
                  url: "/",
                  data: {
                    action: "CHECK"
                  },
                  type: "POST",
                  success: function (response){
                    var data = JSON.parse(response)
                    if(data["count"] == 2){
                      $(".block-page").remove();
                      instance.createFlash("Second player joined");
                      clearInterval(checkingPlayersInterval);
                      ui.block_clicks = false;
                    }
                  }, error: function(xhr,status,error){
                    console.log(xhr);
                  }
                })
              }, 1000);
            }
          }
        },
        error: function(xhr,status,error) {
          // console.log(xhr);
        }
      })
    }

    updateGameArray(){
      $.ajax({
          url: '/',
          data: {
              action: "UPDATE_ARRAY",
              array: JSON.stringify(game.game_array)
          },
          type: 'POST',
          success: function (response) {
            if(response == "START_TIME"){
              net.waitForOtherPlayer()
            } else {
              ui.won_table(response)
            }
          },
          error: function (xhr, status, error) {
              // console.log(xhr);
          },
      })
    }

    waitForOtherPlayer(){
      var div = $("<div class='block-page'>Second player move</div>")
      div.appendTo($("body"));
      ui.block_clicks = true;
      var waitForOtherPlayerMove = setInterval(function(){
        $.ajax({
          url: "/",
          data: {
            action: "WAIT_MOVE",
            array: JSON.stringify(game.game_array)
          },
          type: "POST",
          success: function (response){
            var data = JSON.parse(response);
            if(data["won"] != false){
              ui.won_table(data["won"])
            } else {
              $(".timer").html(data["time"]);
              game.game_array = data["array"];
              if(data["change_move"] || data["time_ended"]){
                ui.block_clicks = false;
                $(".block-page").remove();
                clearInterval(waitForOtherPlayerMove);
                game.updatePawns();
              }
            }
          },
          error: function(xhr, status, error){
            // console.log(xhr);
          }
        })
      },500)
    }

    updatePlayerClock(){
      var myTime = setInterval(function(){
        $.ajax({
          url: "/",
          data: {
            action: "MY_TIME"
          },
          type: "POST",
          success: function(response){
            var data = JSON.parse(response);
            $(".timer").html(data["time"]);
            if(data["ended"]){
              clearInterval(myTime);
              net.waitForOtherPlayer()
            }
          }, error: function(xhr, status, error){
            // console.log(xhr);
          }
        })
      },500)
    }

}
