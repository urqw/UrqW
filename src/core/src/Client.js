import Player from "./Player";
import Game from "./Game";

export default class Client {
  /**
   * @constructor
   */
  constructor(GameInstance) {
    /**
     * @type {Player} проигрыватель
     */
    this.Player = null;

    this.status = Player.PLAYER_STATUS_NEXT;

    this.text = [];

    this.buttons = [];

    this.style = {};

    /**
     * @type int уровень звука
     */
    this.volume = 1;

    /**
     * @type {Game} инстанс игры
     */
    this.Game = GameInstance;
    this.Player = this.Game.Player;
    this.Player.Client = this;
    this.Player.play();
    this.Game.setMode(this.Game.getVar('urq_mode'));
    this.Player.fin();
  }

  /**
   * инстанс новой игры
   */
  static createGame(questname, quest, resources, mode = "urqw") {
    let GameInstance = new Game(questname);
    GameInstance.files = resources;
    GameInstance.setVar("urq_mode", mode);
    GameInstance.init(quest);

    return new Client(GameInstance);
  }

  /**
   * "закрыть" игру
   */
  close() {
    Client.gameMusic.pause();
  }

  /**
   * рендер
   */
  render() {
    // костыли для <img> тега
    let text = this.Player.text;
    for (let i = 0; i < text.length; i++) {
      if (text[i].text !== undefined) {
        let regex = /(<img[^>]+src=")([^">]+)"/i;
        if (regex.test(text[i].text)) {
          var src = text[i].text.match(regex)[2];
          text[i].text = text[i].text.replace(
            /(<img[^>]+src=")([^">]+)"/gi,
            '$1' + this.Game.files[src] + "\""
          );
        }
      }
    }

    this.text = text;
    this.buttons = this.Player.buttons;
    this.setBackColor();
  }

  /**
   * btn
   * @param {String} action
   */
  btnClick(action) {
    if (this.Game.isLocked()) {
      return false;
    }

    return this.Player.action(action);
  }

  /**
   * link
   * @param {String} action
   */
  linkClick(action) {
    if (this.Game.isLocked()) {
      return false;
    }

    return this.Player.action(action, true);
  }

  /**
   * link
   * @param {String} keyCode
   */
  anykeyDone(keyCode) {
    if (this.isStatusAnykey()) {
      return this.Player.anykeyAction(keyCode);
    }

    return false;
  }

  /**
   * link
   * @param {String} text
   */
  inputDone(text) {
    if (this.isStatusInput()) {
      return this.Player.inputAction(text);
    }

    return false;
  }

  /**
   * @return {String}
   */
  static getLineBreakSymbol() {
    return "<br>";
  };

  /**
   * превратить текст и комманду в <a> тег
   * @param {String} text
   * @param {int} action
   */
  static generateLink(text, action) {
    return "<a data-action='" + action + "'>" + text + "</a>";
  };

  /**
   * @param {Array} text
   */
  static removeLinks (text) {
    for (let i = 0; i < text.length; i++) {
      if (text[i].text !== undefined) {
        text[i].text = text[i].text.replace(
          /\<a.+?\>(.+?)\<\/a\>/gi,
          '$1'
        );
      }
    }

    return text;
  };

  /**
   * @return {Boolean}
   */
  isStatusInput() {
    return this.Player.status === Player.PLAYER_STATUS_INPUT;
  }

  /**
   * @return {Boolean}
   */
  isStatusAnykey() {
    return this.Player.status === Player.PLAYER_STATUS_ANYKEY;
  }

  /**
   * @return {Boolean}
   */
  isLocked() {
    return this.Game.isLocked();
  }

  /**
   * @return {Number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * @param {Number} volume
   */
  setVolume(volume) {
    this.volume = volume;
    Client.gameMusic.volume = this.volume;
  }

  /**
   * @return {String}
   */
  getGameName() {
    return this.Game.Name;
  }

  /**
   * @return {Object}
   */
  saveGame() {
    if (this.Game.isLocked()) {
      return false;
    }

    return this.Game.save();
  }

  /**
   * @param {Object} data
   */
  loadGame(data) {
    if (this.Game.isLocked()) {
      return false;
    }

    this.Game.load(data);

    this.render();
  }

  /**
   * @return {Client}
   */
  restartGame() {
    if (this.Player.status === Player.PLAYER_STATUS_NEXT) {
      return false;
    }

    this.Game.restart();

    return new Client(this.Game);
  }

  setBackColor() {
    if (isNaN(this.Game.getVar('style_backcolor'))) {
      this.style.backgroundColor = this.Game.getVar('style_backcolor');
    } else if (this.Game.getVar('style_backcolor') > 0) {
      var red = (this.Game.getVar('style_backcolor') >> 16) & 0xFF;
      var green = (this.Game.getVar('style_backcolor') >> 8) & 0xFF;
      var blue = this.Game.getVar('style_backcolor') & 0xFF;

      this.style.backgroundColor = `rgb(${blue}, ${green}, ${red})`;
    }
  }
}

Client.gameMusic = new Audio();
