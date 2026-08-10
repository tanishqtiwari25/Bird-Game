class MainScene extends Phaser.Scene {
  constructor() {
    super("mainScene");
  }

  preload() {
    // Relative paths with leading dot
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

    // Custom collision box manually set (Safe approach for Web/GitHub Pages)
    if (this.player.body) {
      this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.8);
    }
    if (this.coin.body) {
      this.coin.body.setSize(this.coin.width * 0.8, this.coin.height * 0.8);
    }
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.x -= 4;
    } else if (this.cursors.right.isDown) {
      this.player.x += 4;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= 4;
    } else if (this.cursors.down.isDown) {
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
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: MainScene
};

new Phaser.Game(config);