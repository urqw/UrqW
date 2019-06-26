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
    /**
     * @type {Game} инстанс игры
     */
    this.Game = null;

    this.status = Player.PLAYER_STATUS_NEXT;

    this.text = [];

    this.buttons = [];

    /**
     * @type int уровень звука
     */
    this.volume = 1;

    this.Game = GameInstance;
    this.Player = this.Game.Player;
    this.Player.Client = this;
    this.Player.continue();
  }

  /**
   * инстанс новой игры
   */
  static createGame(questname, quest, resources, mode = "urqw") {
    let GameInstance = new Game(questname);
    GameInstance.files = resources;
    GameInstance.mode = mode;
    GameInstance.init(quest);

    return new Client(GameInstance);
  }

  /**
   * рендер
   */
  render() {
    this.text = this.Player.text;
    this.buttons = this.Player.buttons;
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
      text[i].text = text[i].text.replace(
        /\<a.+?\>(.+?)\<\/a\>/gi,
        '$1'
      );
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
    this.Player.gameMusic.volume = this.volume;
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
    if (this.Game.isLocked()) {
      return false;
    }

    this.Game.restart();

    return new Client(this.Game);
  }
}
