// add client-side event emitting, and other clients
/*
the big idea:
draw client centered in viewport
draw other clients around the centered viewport client
then figure out how to make it all work

*/

// client
let socket = io();
let loaded = false;

// PIXI Aliases
let loader = PIXI.loader,
    Graphics = PIXI.Graphics,
    Sprite = PIXI.Sprite;
    Container = PIXI.Container;

// Create a Pixi Application
let renderer = PIXI.autoDetectRenderer(window.inner, window.innerHeight);

renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.view);


let stage = new Container();
stage.interactive = true;

class Viewpoint {
    constructor(map, x, y) {
        // Map class also has methods to handle the player perspective/viewport
        this.map = map;
        this.viewportX = x;
        this.viewportY = y;

        this.group = new Container();
    }
    draw() {
        this.graphic = new Sprite(loader.resources["/images/bg.png"].texture);
        let graphic = this.graphic;
        this.group.addChild(graphic);
    }

    viewportUpdate(x, y) {
        this.viewportX -= x;
        this.viewportY -= y;
        this.group.position.set(this.viewportX, this.viewportY);

        let group = this.group;
        stage.addChild(group);
    }
}

var player = new Player(window.innerWidth/2, window.innerHeight/2);
var map = new Viewpoint("stuff", player.x, player.y);
var background = new Background(0x00AA00);

let enemyConnectingClient = {}
// maybe move into Viewpoint class
var enemies = {};


// pixi JS animation and setup
function setup() {
    loaded = true;
    let keyIDs = Object.keys(enemyConnectClient); // the keys to the enemyClients object are enemy client IDs
    for(let i = 0; i < keyIDs.length; i++) {
        let playerStateX = enemyConnectClient[keyIDs[i]].playerState.globalX;
        let playerStateY = enemyConnectClient[keyIDs[i]].playerState.globalY;
        
        let enemyPlayer = new Player(playerStateX, playerStateY);
        enemies[Object.keys(enemyConnectClient)[i]] = enemyPlayer;
        enemies[Object.keys(enemyConnectClient)[i]].draw(map.group);
    }

    console.log("Local client enemy data after this client joined: " + JSON.stringify(Object.keys(enemies)));

    //background.draw();
    map.draw();
    stage.addChild(map.group);

    player.detectPress();

    player.draw(stage);

    animate();
}


function animate() {
    map.viewportUpdate(player.vx, player.vy);

    player.update();

    renderer.render(stage);
    requestAnimationFrame(animate);
}

// visual bug: when connecting, no rotation is shown when instantiated: fix it
// visual? bug: enemy players may or may not be drawn in what seems to be a pure random pattern, and if you refresh they may appear or disappear: fix it, may relate to below
// ^ when a new player joins and the second player, and the other players are unfocused, the other players are not drawn on new player. why? ^
// visual bug 2 is client side, relating to display things
// visual bug 2 theory: clients connect and are drawn before pictures are actually loaded, causing them to not display. figure out how to fix/edit
// visual bug 2 update: not displaying or displaying incorrectly related to connection before loading and also maybe unfocusing
// error: when player moves before other player connects, the new connecting player does not draw with an error in playerMove
// socket? bug: playerMove is detected by client before enemies object is updated 
socket.on('connectingClientInfo', enemyClients => {
    loader.add(["/images/player.png", "/images/bg.png"]).load(setup);
    enemyConnectClient = enemyClients;
    //console.log("My Socket Client ID is: " + socket.io.engine.id);
    //console.log('server data recieved: ' + JSON.stringify(enemyClients));
});

socket.on('newUser', clientData => {
    console.log("New user " + clientData.playerState.clientID + " has joined.");
    var playerStateX = clientData.playerState.globalX;
    var playerStateY = clientData.playerState.globalY;
    var enemyPlayer = new Player(playerStateX, playerStateY);
    enemies[clientData.playerState.clientID] = enemyPlayer;
    enemies[clientData.playerState.clientID].draw(map.group);
    console.log("Local client enemy data after new user join: " + JSON.stringify(Object.keys(enemies)));
});

socket.on('playerMove', data => {
    if (loaded) {
        // console.log("client side playerMove data clientID: " + data.clientID);
        enemies[data.clientID].move(data);
    }
});

socket.on('clientDisconnect', clientID => {
    enemies[clientID].delete();
    delete enemies[clientID];
});
