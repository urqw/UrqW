/**
 * @constructor
 */
function Client() {
    this.status = Game.Player.PLAYER_STATUS_NEXT;
    this.text = [];
    this.buttons = [];
}

/**
 * рендер
 */
Client.prototype.render = function() {
    this.status = Game.Player.status;
    this.text = Game.Player.text;
    this.buttons = Game.Player.buttons;
};

export default Client;
