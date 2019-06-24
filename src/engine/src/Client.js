import Player from "./Player";

export default class Client {
  /**
   * @constructor
   */
  constructor() {
    /**
     * @type {Player} проигрыватель
     */
    this.Player = null;

    this.status = Player.PLAYER_STATUS_NEXT;

    this.text = [];

    this.buttons = [];

    /**
     * @type int уровень звука
     */
    this.volume = 1;
  }

  /**
   * рендер
   */
  render() {
    this.status = this.Player.status;
    this.text = this.Player.text;
    this.buttons = this.Player.buttons;
  }

  /**
   * btn
   * @param {String} action
   */
  btnClick(action) {
    return this.Player.action(action);
  }

  /**
   * link
   * @param {String} action
   */
  linkClick(action) {
    return this.Player.action(action, true);
  }

  /**
   * link
   * @param {String} keyCode
   */
  anykeyDone(keyCode) {
    return this.Player.anykeyAction(keyCode);
  }

  /**
   * link
   * @param {String} text
   */
  inputDone(text) {
    return this.Player.inputAction(text);
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

  isStatusInput() {
    return this.status === Player.PLAYER_STATUS_INPUT;
  }

  isStatusAnykey() {
    return this.status === Player.PLAYER_STATUS_ANYKEY;
  }

  /**
   * @param {Number} volume
   */
  setVolume(volume) {
    this.volume = volume;
  }
}
