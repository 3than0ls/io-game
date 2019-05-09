// for the states of the game that the back end will send to the front end and then front end will use

module.exports = {
    PlayerState: class {
        constructor(clientID) {
            this.clientID = clientID;
            this.globalX = 0;
            this.globalY = 0;
            // assign other kind of stats about the player
        }
    }
}
