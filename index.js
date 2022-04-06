const montyHall = {
  // score and stats
  numWin: 0,
  numLoss: 0,
  status (msg = 'Choose a door.') {
    this.context.clearRect(0, 0, this.canvas.width / 2, this.gameWindowStartY);
    this.context.fillText(msg, 10, 30);
  },
  results () {
    const ratio = ((1.0 * this.numWin / (this.numWin + this.numLoss)) * 100).toFixed(1);
    const msg = `Wins: ${this.numWin} | Loss: ${this.numLoss} | Ratio: ${ratio}%`;

    this.context.clearRect(this.canvas.width / 2, 0, this.canvas.width / 2, this.gameWindowStartY);
    this.context.fillText(msg, this.canvas.width / 2, 30);
  },
  // game
  canvas: null,
  context: null,
  gameState: 0,
  imageOpenDoor: null,
  imageCloseDoor: null,
  imageCheck: null,
  imageGoat: null,
  imageCar: null,
  carDoor: null,
  goatDoors: [],
  doors: [],
  chosenDoor: null,
  openDoor: 0,
  gameWindowStartY: 50,
  load (canvasId = 'gameArea', imgPath = 'img') {
    // load canvas
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');
    // load images src
    this.imageOpenDoor = new Image();
    this.imageCloseDoor = new Image();
    this.imageCheck = new Image();
    this.imageGoat = new Image();
    this.imageCar = new Image();

    this.imageOpenDoor.src = `${imgPath}/door_open.png`;
    this.imageCloseDoor.src = `${imgPath}/door_closed.png`;
    this.imageCheck.src = `${imgPath}/check.png`;
    this.imageGoat.src = `${imgPath}/goat.png`;
    this.imageCar.src = `${imgPath}/car.png`;

    // draw images
    this.imageCloseDoor.onload = () => {
      this.resetDoors();
    };
    
    this.context.font = '20px serif';
    this.context.textAlign = 'left';

    console.log("Game Loaded!");
  },
  addEventOnClick () {
    this.canvas.addEventListener('click', (event) => {
      let rect = this.canvas.getBoundingClientRect();
      let x = event.pageX - rect.left;
      let y = event.pageY - rect.top;

      this.chooseDoor(x);
    }, false);
    console.log("Event on click was set!");
  },
  resetDoors () {
    // reset canvas
    this.context.clearRect(0, this.gameWindowStartY, this.canvas.width, this.canvas.height);
    // draw images
    this.context.drawImage(this.imageCloseDoor, 0, 0 + this.gameWindowStartY, 200, 350);
    this.context.drawImage(this.imageCloseDoor, 200, 0 + this.gameWindowStartY, 200, 350);
    this.context.drawImage(this.imageCloseDoor, 400, 0 + this.gameWindowStartY, 200, 350);
  },
  start () {
    // resets
    this.gameState = 0; // -1: Game is finished | 0: Player chose a door | 1: Player chose to stay or switch
    this.chosenDoor = 0; // First door choosen
    this.openDoor = 0; // Door choosen after stay or switch
    this.doors = [false, false, false]; // available doors
    this.carDoor = Math.floor(Math.random() * 3); // Door with car
    this.goatDoors = []; // Doors with goats

    let i = -1
    while (++i < 3) {
      if (i != this.carDoor) {
        this.goatDoors.push(i)
      }
    }

    this.resetDoors();

    this.status();

    console.log("Game Started!")
  },
  loadAndStart (canvasId = 'gameArea', imgPath = 'img') {
    this.load(canvasId, imgPath);
    this.start();
  },
  drawContent () {
    // reset canvas
    this.context.clearRect(0, this.gameWindowStartY, this.canvas.width, this.canvas.height);
    // draw car
    this.context.drawImage(this.imageCar, this.carDoor * 200 + 50, 200 + this.gameWindowStartY, 120, 80);
    // draw goat
    this.goatDoors.forEach((door) => {
      this.context.drawImage(this.imageGoat, door * 200 + 75, 180 + this.gameWindowStartY, 101, 100);
    });

    // open/close door
    let i = -1;
    while (++i < 3) {
      if (!this.doors[i]) {
        this.context.drawImage(this.imageCloseDoor, i * 200, 0 + this.gameWindowStartY, 200, 350);
      } else {
        this.context.drawImage(this.imageOpenDoor, i * 200 - 2, 0 + this.gameWindowStartY, 212, 370);
      }
    }

    // draw a checkmark on selected door
    this.context.drawImage(this.imageCheck, this.chosenDoor * 200 + 70, 130 + this.gameWindowStartY, 70, 70);
  },
  chooseDoor (doorX) {
    console.log("User click on door", this.gameState)
    if (!doorX) {
      alert("Choose a door.");
      return false;
    }

    if (this.gameState == -1) {
      // restart game
      this.start();
      return false;
    }

    if (this.gameState === 0) {
      // first click 
      if (doorX < 200 && doorX > 0) { this.chosenDoor = 0; }
      if (doorX < 400 && doorX > 200) { this.chosenDoor = 1; }
      if (doorX < 600 && doorX > 400) { this.chosenDoor = 2; }

      this.openDoor = Math.floor(Math.random() * 3);
      while (this.openDoor == this.chosenDoor || this.openDoor == this.carDoor) {
        this.openDoor = Math.floor(Math.random() * 3);
      }

      this.doors[this.openDoor] = true;

      this.gameState = 1;

      this.status('Stay or switch?');
    } else if (this.gameState === 1) {
      // second click
      let open = 0;
      if (doorX < 200 && doorX > 0) { open = 0; }
      if (doorX < 400 && doorX > 200) { open = 1; }
      if (doorX < 600 && doorX > 400) { open = 2; }

      if (open == this.openDoor) {
        // user clicked on same door
        return false;
      }

      this.doors[open] = true;

      // check if you win or not
      const win = open == this.carDoor;
      if (win) {
        this.numWin++;

        this.status('You win! Play again?');
      } else {
        this.numLoss++;
        this.status('You lost. Play again?');
      }
      this.results();

      this.gameState = -1;

      console.log("Game Over");
    }

    this.drawContent();
  }
}

montyHall.loadAndStart();
montyHall.addEventOnClick();