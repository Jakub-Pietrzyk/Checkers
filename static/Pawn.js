console.log("wczytano plik Pawn.js")
class Pawn extends THREE.Mesh {
    constructor(color, row, column) {
      var pawnGeometry = new THREE.CylinderGeometry(13, 13, 6, 10);
      var material = new THREE.MeshBasicMaterial({color: color, side: THREE.DoubleSide});
      super(pawnGeometry,material)
      this._color = color
      this.row = row
      this.column = column
    }

    set color(val) {
      this._color = val
    }

    get color() {
      return this._color
    }

    get_possible_fields(){
      var return_arr = [];

      var correctRow
      var correctColumns = [];
      if(net.player_color == "black") correctRow = this.row + 1
      if(net.player_color == "white") correctRow = this.row - 1

      var is_friendly_right = false;
      var is_friendly_left = false;
      var is_enemy_right = false;
      var is_enemy_left = false;
      var enemy_right = null;
      var enemy_left = null;
      for(var i=0;i<game.pawns[net.player_color].length;i++){
        if (game.pawns[net.player_color][i].row == correctRow && game.pawns[net.player_color][i].column == (this.column + 1)) is_friendly_right = true;
      }
      for(var i=0;i<game.pawns[net.player_color].length;i++){
        if (game.pawns[net.player_color][i].row == correctRow && game.pawns[net.player_color][i].column == (this.column - 1)) is_friendly_left = true;
      }

      for(var i=0;i<game.pawns[net.enemy_color].length;i++){
        if (game.pawns[net.enemy_color][i].row == correctRow && game.pawns[net.enemy_color][i].column == (this.column + 1)){is_enemy_right = true; enemy_right = game.pawns[net.enemy_color][i]}
      }
      for(var i=0;i<game.pawns[net.enemy_color].length;i++){
        if (game.pawns[net.enemy_color][i].row == correctRow && game.pawns[net.enemy_color][i].column == (this.column - 1)){is_enemy_left = true; enemy_left = game.pawns[net.enemy_color][i]}
      }

      if(!is_friendly_right && !is_enemy_right) correctColumns.push(this.column +1);
      if(!is_friendly_left && !is_enemy_left) correctColumns.push(this.column -1);

      var pawns = [game.pawns["white"], game.pawns["black"]].flat()

      if(is_enemy_right){
        if(net.player_color == "black") var row = correctRow + 1
        if(net.player_color == "white") var row = correctRow - 1
        var column = this.column + 2;
        var can = true;
        for(var i=0;i<pawns.length;i++){
          if(pawns[i].row == row && pawns[i].column == column) can = false;
        }
        if(column >= 0 && column <= 7 && row >= 0 && row <= 7 && can) return_arr.push([row,column])
      }
      if(is_enemy_left){
        if(net.player_color == "black") var row = correctRow + 1
        if(net.player_color == "white") var row = correctRow - 1
        var column = this.column - 2;
        var can = true;
        for(var i=0;i<pawns.length;i++){
          if(pawns[i].row == row && pawns[i].column == column) can = false;
        }
        if(column >= 0 && column <= 7 && row >= 0 && row <= 7 && can) return_arr.push([row,column])
      }

      for(var i=0;i<correctColumns.length;i++){
        if(correctColumns[i] >= 0 && correctColumns[i] <= 7) return_arr.push([correctRow,correctColumns[i]])
      }

      return [return_arr,{enemy_left: enemy_left, enemy_right: enemy_right}]
    }

    setActivePawn(){
      Object.keys(game.moveable_fields).forEach(function(e){
        game.scene.getObjectByName(e).material.color.set("#000000");
      })

      if(this != ui.active_pawn){
        for(var i=0;i< game.pawns[net.player_color].length;i++){
          game.pawns[net.player_color][i].material.color.set(game.COLORS[net.player_color].color)
        }
        this._color = "#FFA500"
        this.material.color.set("#FFA500")
        ui.active_pawn = this;

        var possible = this.get_possible_fields();
        for(var i=0;i<possible[0].length;i++){
          game.scene.getObjectByName(possible[0][i][0] + "-" + possible[0][i][1]).material.color.set("#A5FF00");
        }
      } else {
        ui.active_pawn = null;
        this.material.color.set(game.COLORS[net.player_color].color)
      }
    }

    movePawn(field){
      var correctRows = [];
      if(net.player_color == "black") correctRows.push(this.row + 1);
      if(net.player_color == "white") correctRows.push(this.row - 1);
      var correctColumns = [this.column + 1, this.column - 1]
      var field_data = game.moveable_fields[field.name]
      var old_row = this.row;
      var old_column = this.column;
      var point = [field_data["row"],field_data["column"]]
      var possible = this.get_possible_fields();
      for(var i=0;i<possible[0].length;i++){
        possible[0][i] = JSON.stringify(possible[0][i])
      }

      if(possible[0].includes(JSON.stringify(point))){
        this.position.x = field.position.x;
        this.position.z = field.position.z;
        this.row = field_data["row"];
        this.column = field_data["column"];
        game.game_array[old_row][old_column] = 0;
        if(net.player_color == "white"){
          game.game_array[this.row][this.column] = 2
        } else if (net.player_color == "black"){
          game.game_array[this.row][this.column] = 1
        }
        ui.active_pawn = null;
        this.material.color.set(game.COLORS[net.player_color].color);
        if(possible[1]["enemy_right"] != null && old_column < field_data["column"]){
          game.game_array[possible[1]["enemy_right"].row][possible[1]["enemy_right"].column] = 0;
          game.pawns[net.enemy_color].forEach(function(e){
            if(e == possible[1]["enemy_right"]){
              var index = game.pawns[net.enemy_color].indexOf(e);
              if (index > -1) {
                game.pawns[net.enemy_color].splice(index, 1);
              }
            }
          })
          game.scene.remove(possible[1]["enemy_right"]);
        }
        if(possible[1]["enemy_left"] != null && old_column > field_data["column"]){
          game.game_array[possible[1]["enemy_left"].row][possible[1]["enemy_left"].column] = 0;
          game.pawns[net.enemy_color].forEach(function(e){
            if(e == possible[1]["enemy_left"]){
              var index = game.pawns[net.enemy_color].indexOf(e);
              if (index > -1) {
                game.pawns[net.enemy_color].splice(index, 1);
              }
            }
          })
          game.scene.remove(possible[1]["enemy_left"]);
        }
        Object.keys(game.moveable_fields).forEach(function(e){
          game.scene.getObjectByName(e).material.color.set("#000000");
        })
        net.updateGameArray();
      }
    }
  }
