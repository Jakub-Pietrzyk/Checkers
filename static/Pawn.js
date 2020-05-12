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

    setActivePawn(){
      if(this != ui.active_pawn){
        for(var i=0;i< game.pawns[net.player_color].length;i++){
          game.pawns[net.player_color][i].material.color.set(game.COLORS[net.player_color].color)
        }
        this._color = "#FFA500"
        this.material.color.set("#FFA500")
        ui.active_pawn = this
      } else {
        ui.active_pawn = null;
        this.material.color.set(game.COLORS[net.player_color].color)
      }
    }

    movePawn(field){
      var correctRows = [this.row + 1, this.row - 1]
      var correctColumns = [this.column + 1, this.column - 1]
      var field_data = game.moveable_fields[field.uuid]
      if(correctRows.includes(field_data["row"]) && correctColumns.includes(field_data["column"])){
        var is_friendly_pawn = false
        for(var i=0;i<game.pawns[net.player_color].length;i++){
          if (game.pawns[net.player_color][i].row == field_data["row"] && game.pawns[net.player_color][i].column == field_data["column"]) is_friendly_pawn = true;
        }

        if(!is_friendly_pawn){
          this.position.x = field.position.x;
          this.position.z = field.position.z;
          this.row = field_data["row"];
          this.column = field_data["column"];
        }
      }
    }
  }
