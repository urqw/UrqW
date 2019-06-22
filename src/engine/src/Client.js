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
}
