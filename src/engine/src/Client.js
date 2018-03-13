import Player from "./Player";

/**
 * @constructor
 */
function Client() {
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
Client.prototype.render = function() {
    this.status = this.Player.status;
    this.text = this.Player.text;
    this.buttons = this.Player.buttons;
};

/**
 * btn
 */
Client.prototype.btn = function(action) {
    return this.Player.action(action)
};

export default Client;
