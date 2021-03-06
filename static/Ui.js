console.log("wczytano plik Ui.js");
class Ui {
    constructor() {
        console.log("konstruktor klasy Ui")
        this.clicks();
        this.active_pawn = null;
        this.block_clicks = false;
    }

    clicks(){
      $("#login").on("click",function(){
        if ($("#nick").val() == ""){
          net.createFlash("Podaj nick");
        } else {
          net.nick = $("#nick").val();
          net.loginUser();
        }
      })

      $("#reset").on("click",function(){
        net.resetUsers();
      })
    }

    game_clicks(){
      $(document).mousedown(function (event) {
          game.mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
          game.mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
          game.raycaster.setFromCamera(game.mouseVector, game.camera);

          var intersects = game.raycaster.intersectObjects(game.scene.children);

          if (intersects.length > 1 && net.logged && !ui.block_clicks) {
            var name = intersects[0].object.name

            if(Object.keys(game.moveable_fields).includes(name) && ui.active_pawn != null){
              ui.active_pawn.movePawn(intersects[0].object);
            }

            if (game.pawns[net.player_color].includes(intersects[0].object)){
              intersects[0].object.setActivePawn();
            }
          }
      })
    }

    removeFlashBtn(){
      $(".remove-flash").on("click",function(){
        $(".flash").remove();
      })
    }

    won_table(text){
      if(text == "BLACK_WON") var div = $("<div class='block-page'>Black player won</div>")
      if(text == "WHITE_WON") var div = $("<div class='block-page'>White player won</div>")
      div.appendTo($("body"));
      ui.block_clicks = true;
    }
}
