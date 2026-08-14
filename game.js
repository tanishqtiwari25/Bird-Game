class MainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
    
    // Touch buttons ki state track karne ke liye flags
    this.moveState = {
      left: false,
      right: false,
      up: false,
      down: false
    };
  }

  preload() {
    this.load.image("player", "./asset/1785586896114.png");
    this.load.image("coin", "./asset/17879868.png");
  }

  create() {
    this.player = this.physics.add.sprite(100, 100, "player");
    this.player.setScale(0.1);

    this.coin = this.physics.add.sprite(300, 200, "coin");
    this.coin.setScale(0.15);

    this.score = 0;

    this.scoreText = this.add.text(20, 20, "Score : 0", {
      font: "24px Arial",
      fill: "#ffffff"
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    if (this.player.body) {
      this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.8);
    }
    if (this.coin.body) {
      this.coin.body.setSize(this.coin.width * 0.8, this.coin.height * 0.8);
    }

    // Touch Buttons setup karna
    this.setupTouchControls();
  }

  setupTouchControls() {
    const bindTouch = (id, direction) => {
      const btn = document.getElementById(id);
      if (!btn) return;

      // Pressing start
      const startMove = (e) => {
        e.preventDefault();
        this.moveState[direction] = true;
      };

      // Pressing end
      const stopMove = (e) => {
        e.preventDefault();
        this.moveState[direction] = false;
      };

      btn.addEventListener("touchstart", startMove, { passive: false });
      btn.addEventListener("touchend", stopMove, { passive: false });
      btn.addEventListener("mousedown", startMove);
      btn.addEventListener("mouseup", stopMove);
      btn.addEventListener("mouseleave", stopMove);
    };

    bindTouch("btnUp", "up");
    bindTouch("btnDown", "down");
    bindTouch("btnLeft", "left");
    bindTouch("btnRight", "right");
  }

  update() {
    // Keyboard inputs YA Touch Button inputs dono check karega
    const moveLeft = this.cursors.left.isDown || this.moveState.left;
    const moveRight = this.cursors.right.isDown || this.moveState.right;
    const moveUp = this.cursors.up.isDown || this.moveState.up;
    const moveDown = this.cursors.down.isDown || this.moveState.down;

    if (moveLeft) {
      this.player.x -= 4;
    } else if (moveRight) {
      this.player.x += 4;
    }

    if (moveUp) {
      this.player.y -= 4;
    } else if (moveDown) {
      this.player.y += 4;
    }

    if (this.physics.overlap(this.player, this.coin)) {
      this.collectCoin();
    }
  }

  collectCoin() {
    this.score += 10;
    this.scoreText.setText("Score : " + this.score);

    this.coin.x = Phaser.Math.Between(50, 650);
    this.coin.y = Phaser.Math.Between(50, 350);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 400,
  backgroundColor: "#3498db",
  parent: "game",
  scale: {
    mode: Phaser.Scale.FIT, // Canvas screen width ke according fit ho jayega
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: MainScene
};

new Phaser.Game(config);