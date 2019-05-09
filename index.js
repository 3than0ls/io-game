const gameStates = require('./game_states.js');
const express = require('express');
const app = express();

app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

const http = require('http').Server(app);
const io = require('socket.io')(http);


let clientData = {};
let clientCount = 0;


io.on('connection', function(socket) {
  // add client socket to clientData dictionary
  // we use
  clientData[socket.id] = {
    playerState: new gameStates.PlayerState(socket.id)
  }
  clientCount++;
  console.log("A client connected. Client data created: " + JSON.stringify(clientData[socket.id]));
  /*
  filter current client from client data to send to client
  first we create a deep copy of clientData using the JSON methods
  then we filter out the connecting clients info and send it
  */
  let enemyClients = JSON.parse(JSON.stringify(clientData));
  delete enemyClients[socket.id];
  //console.log(JSON.stringify(enemyClients));

  // sends connecting client all the clients connected before that client
  socket.emit('connectingClientInfo', enemyClients);
  // then broadcast the joining of a new client
  socket.broadcast.emit('newUser', clientData[socket.id]);
  
  socket.on('playerMove', function(data) {
    // player has moved!
    clientData[data.clientID].playerState.globalX += data.vx;
    clientData[data.clientID].playerState.globalY += data.vy;
    
    socket.broadcast.emit('playerMove', data);
  });

  // when disconnected, delete client from dictionary
  socket.on('disconnect', () => {
    console.log("A client disconnected. Client data being deleting: " + JSON.stringify(clientData[socket.id])); // is undefined, clientData is already empty
    socket.broadcast.emit('clientDisconnect', socket.id);
    delete clientData[socket.id];
    clientCount--;
  });
});


http.listen(3000, function() {
  console.log('listening on *:3000');
});
