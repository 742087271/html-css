const doms = {
  letterContainer: document.querySelector('.letter-container'),
  score: document.querySelector('#score'),
};

class Utils {
  static getRandomLetter() {
    var code = this.getRandom(65, 65 + 25);
    return String.fromCharCode(code);
  }
  static getRandom(min, max) {
    max++;
    return Math.floor(Math.random() * (max - min) + min);
  }
  static waitPaint() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  }
}

class Letter {
  constructor() {
    this.__init();
    this.__drop();
  }
  __init() {
    // create letter
    this.char = Utils.getRandomLetter();
    // get random duration
    this.duration = Utils.getRandom(3000, 20000);
    // create dom
    this.dom = document.createElement('img');
    // set class
    this.dom.className = 'letter';
    // set src
    this.dom.src = `./img/letter/${this.char}.png`;
    // get random position
    this.x = Utils.getRandom(0, doms.letterContainer.clientWidth - 100);
    // set position
    this.dom.style.left = this.x + 'px';
    // set duration
    this.dom.style.setProperty('--duration', this.duration + 'ms');
    doms.letterContainer.appendChild(this.dom);
  }
  kill() {
    this.dom.remove();
  }

  async __drop() {
    await Utils.waitPaint();
    this.dom.style.transform = 'translateY(100vh)';
    this.dom.style.opacity = 0.5;
    this.dom.addEventListener(
      'transitionend',
      () => {
        this.onLost && this.onLost();
        this.dom.remove();
      },
      {
        once: true,
      }
    );
  }
}

class Game {
  constructor(duration = 1000) {
    this.letters = [];
    this.hitCount = 0;
    this.lostCount = 0;
    this.produceTimerId = null;
    this.duration = duration;
    this.__start();
    this.__produceLetter();
    this.__renderScore();
  }

  __remove(letter) {
    this.letters = this.letters.filter((l) => l !== letter);
  }

  __produceLetter() {
    const letter = new Letter();
    this.letters.push(letter);
    letter.onLost = () => {
      this.__remove(letter);
      this.lostCount++;
      this.__renderScore();
    };
  }

  __startProduce() {
    if (this.produceTimerId) {
      return;
    }
    this.produceTimerId = setInterval(() => {
      this.__produceLetter();
    }, this.duration);
  }

  __start() {
    this.__startProduce();
  }

  __renderScore() {
    doms.score.innerHTML = `
    <p>命中：${this.hitCount}</p>
    <p>丢失：${this.lostCount}</p>
    `;
  }

  hit(letterChar) {
    letterChar = letterChar.toUpperCase();
    const letter = this.letters.find((l) => l.char === letterChar);
    if (letter) {
      this.__remove(letter);
      letter.kill();
      this.hitCount++;
      this.__renderScore();
    }
  }
}

var g = new Game(1000);

window.onkeydown = function (e) {
  g.hit(e.key);
};
