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

        var row = [];
        var change = false;
        for(var i=0;i<65;i++){
          if((i%8==0 && i != 0) || i == 64){
            this.szachownica.push(row);
            row = [];
            change = !change
          }
          var obj = {color: "white", player: ""}
          if(i%2 == 0){
            if(change){
              obj.color = "black"
              if(i > 47) obj["player"] = "white";
              if(i < 16) obj["player"] = "black";
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
              if(i > 47) obj["player"] = "white";
              if(i < 16) obj["player"] = "black";
            }
          }
          row.push(obj)
        }

        this.createField()
        this.createPawns()
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
          this.scene.add(cube);
          if(row[j].color == "black"){
            this.moveable_fields[cube.uuid] = {"row": moveable_row, "column": moveable_column}
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
    }
}
