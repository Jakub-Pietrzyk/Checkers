console.log("wczytano plik Net.js")
class Net {
    constructor() {
        console.log("konstruktor klasy Net");
        this.logged = false;
        this.nick = "";
        this.player_color = "";
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
              console.log(xhr);
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
            if(data["id"] == 1){
              var div = $("<div class='block-page'>Waiting for second player to join</div>")
              div.appendTo($("body"))
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
          console.log(xhr);
        }
      })
    }
}
