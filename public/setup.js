// make player more easier to use
class Player {
    constructor(x, y, id) {
        this.x = x; // used for actual position on screen, not map global position
        this.y = y;
        this.id = id;

        this.vx = 0; // used for viewpoint changing
        this.vy = 0;
        this.speed = 6;
        this.angle = 0;

    }
    detectPress() {
        let w = keyboard(87),
            a = keyboard(65),
            s = keyboard(83),
            d = keyboard(68);

        // A (move left) key
        a.press = () => {
            this.vx = -this.speed;
        }
        a.release = () => {
            if (!d.isDown) {
                this.vx = 0;
            }
        }
        // W (move up) key
        w.press = () => {
            this.vy = -this.speed;
        }
        w.release = () => {
            if (!s.isDown) {
                this.vy = 0;
            }
        }
        // D (move right) key
        d.press = () => {
            this.vx = this.speed;
        }
        d.release = () => {
            if (!a.isDown) {
                this.vx = 0;
            }
        }
        // S (move down) key
        s.press = () => {
            this.vy = this.speed;
        }
        s.release = () => {
            if (!w.isDown) {
                this.vy = 0;
            }
        }
    }
    draw(group) {
        this.graphic = new Sprite(loader.resources["/images/player.png"].texture);
        // only needs to be assigned once
        this.graphic.anchor.x = 0.5;
        this.graphic.anchor.y = 0.5;
        this.graphic.position.set(this.x, this.y);
        
        let graphic = this.graphic; // if we directly put this.graphics into .addChild below, it does not work
        group.addChild(graphic);
    }
    update() {
        // update mouse position variables
        this.mouseX = renderer.plugins.interaction.mouse.global.x;
        this.mouseY = renderer.plugins.interaction.mouse.global.y;
        // update angle 
        let deltaY = this.mouseX - this.x,
            deltaX = this.mouseY - this.y;
        let angle = -Math.atan2(deltaY, deltaX);

        // update graphics
        this.graphic.rotation = angle;

        /* update and send info to server */
        socket.emit('playerMove', { 
            clientID: socket.io.engine.id,
            vx: this.vx, 
            vy: this.vy,
            angle: angle,
        });
        let graphic = this.graphic;
        stage.addChild(graphic);
    }
    move(moveData) {
        /* move is used for moving the enemies*/
        this.x += moveData.vx;
        this.y += moveData.vy;
        this.graphic.position.set(this.x, this.y);
        this.graphic.rotation = moveData.angle;
        let graphic = this.graphic;
        map.group.addChild(graphic);
    }
    delete() {
        map.group.removeChild(this.graphic);
    }
}

class Background {
    constructor(color) {
        this.color = color;
        this.background = new PIXI.Graphics();
    }
    draw() {
        this.background.beginFill(this.color);  
        this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);  
        this.background.endFill();
        let background = this.background;
        stage.addChild(background);
    }
}


//The `keyboard` helper function
function keyboard(keyCode) {
    var key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
  
    //The `downHandler`
    key.downHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };
  
    //The `upHandler` 
    key.upHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };  
  
    //Attach event listeners
    window.addEventListener(
        "keydown", key.downHandler.bind(key), false
    );
    window.addEventListener(
        "keyup", key.upHandler.bind(key), false
    );
    return key;  
}


