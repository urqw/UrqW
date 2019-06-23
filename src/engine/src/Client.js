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
   */
  btn(action) {
    return this.Player.action(action);
  }

  /**
   * link
   */
  link(action) {
    return this.Player.action(action, true);
  }

  /**
   * превратить текст и комманду в <a> тег
   * @param {String} text
   * @param {int} action
   */
  convertToLink(text, action) {
    return "<a data-action='" + action + "'>" + text + "</a>";
  };
}
