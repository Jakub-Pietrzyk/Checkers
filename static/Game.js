console.log("wczytano plik Game.js")
class Game {
    constructor() {
        console.log("konstruktor klasy Game");
        this.COLORS = {
          "white": {"color": "#ffffff", "camera": 1},
          "black": {"color": '#000000', "camera": -1}
        }

        this.szachownica = [];
        this.moveable_fields = {};
        this.game_array = [];

        var row = [];
        var arrayRow = [];
        var change = false;
        for(var i=0;i<65;i++){
          var toArray = 0;
          if((i%8==0 && i != 0) || i == 64){
            this.szachownica.push(row);
            this.game_array.push(arrayRow);
            row = [];
            arrayRow = [];
            change = !change
          }
          var obj = {color: "white", player: ""}
          if(i%2 == 0){
            if(change){
              obj.color = "black"
              if(i > 47){
                obj["player"] = "white";
                toArray = 2;
              }
              if(i < 16){
                obj["player"] = "black";
                toArray = 1;
              }
            } else {
              obj.color = "white"
              // if(i < 16) obj["player"] = "black";
            }

          } else {
            if(change){
              obj.color = "white"
              // if(i < 16) obj["player"] = "black";
            } else {
              obj.color = "black"
              if(i > 47){
                obj["player"] = "white";
                toArray = 2;
              }
              if(i < 16){
                obj["player"] = "black";
                toArray = 1;
              }
            }
          }
          row.push(obj);
          arrayRow.push(toArray);
        }

        this.createField()
        this.createPawns()

        console.log(this.game_array);
    }

    createField(){
      var div = $("<div id='root'>");
      div.appendTo($("body"));

      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setClearColor(0xAAAAAA);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      $("#root").append( this.renderer.domElement );
      this.camera = new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,10000);

      this.render();

      var cubeGeometry = new THREE.BoxGeometry(30, 30, 30);

      var moveable_column = 0;
      var moveable_row = 0;

      for(var i=0;i<this.szachownica.length;i++){
        var row = this.szachownica[i];
        for(var j=0;j<row.length;j++){
          var material = new THREE.MeshBasicMaterial({color: this.COLORS[row[j].color].color, side: THREE.DoubleSide});
          var cube = new THREE.Mesh(cubeGeometry, material)
          cube.position.set(-120 + j * 30,0,-120 + i * 30)
          cube.name = i + "-" + j
          this.scene.add(cube);
          if(row[j].color == "black"){
            this.moveable_fields[cube.name] = {"row": moveable_row, "column": moveable_column}
          }
          moveable_column++;
        }
        moveable_row++;
        moveable_column = 0;
      }
    }

    createPawns(){
      this.pawns = {
        "black": [],
        "white": []
      }

      var moveable_column = 0;
      var moveable_row = 0;

      for(var i=0;i<this.szachownica.length;i++){
        var row = this.szachownica[i];
        for(var j=0;j<row.length;j++){
          if(row[j].player != ""){
            var pawn = new Pawn(this.COLORS[row[j].player].color, moveable_row, moveable_column)
            pawn.position.set(-120 + j * 30,18,-120 + i * 30)
            pawn.name = "pawn"
            this.scene.add(pawn);
            this.pawns[row[j].player].push(pawn);
          }
          moveable_column++;
        }
        moveable_row++;
        moveable_column = 0;
      }
      ui.game_clicks();
    }

    render() {

      requestAnimationFrame(this.render.bind(this));
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth/window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }

    addUser(color){
      $(".login").remove();
      game.camera.position.z = 300 * game.COLORS[color].camera;
      game.camera.position.x = 0
      game.camera.position.y = 200 * 1;
      game.camera.lookAt(game.scene.position);

      game.raycaster = new THREE.Raycaster();
      game.mouseVector = new THREE.Vector2();
      if(color == "white"){
        net.updateGameArray();
      }
    }

    updatePawns(){
      var white_array = game.pawns["white"];
      var black_array = game.pawns["black"];
      var black_count = 0;
      var white_count = 0;
      var fields_obj = {};
      Object.keys(game.moveable_fields).forEach(function(e){
        var row = game.moveable_fields[e]["row"];
        var column = game.moveable_fields[e]["column"];
        if (fields_obj[row] == null) fields_obj[row] = {};
        fields_obj[row][column] = e
      })

      for(var i=0;i<game.game_array.length;i++){
        var row = game.game_array[i];
        for(var j=0;j<row.length;j++){
          var field = game.scene.getObjectByName(fields_obj[i][j]);
          if(row[j] == 1){
            black_array[black_count].position.x = field.position.x;
            black_array[black_count].position.z = field.position.z;
            black_array[black_count].row = i
            black_array[black_count].column = j
            black_count++;
          } else if(row[j] == 2){
            white_array[white_count].position.x = field.position.x;
            white_array[white_count].position.z = field.position.z;
            white_array[white_count].row = i
            white_array[white_count].column = j
            white_count++;
          }
        }
      }
    }
}
