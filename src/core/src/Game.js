import Quest from "./Quest";
import Player from "./Player";
import ModeUrqRip from "./modes/urqrip";
import ModeUrqDos from "./modes/urqdos";

/**
 * Игра (состояние)
 */
export default class Game {
  constructor(name) {
    /**
     * @type {boolean}
     */
    this.locked = true;

    /**
     * @type {Object}
     */
    this.items = {};

    this.files = {};

    /**
     * @type {Object}
     */
    this.vars = {};

    /**
     * @type {Object}
     */
    this.systemVars = {
      urq_mode: "urqw"
    };

    /**
     * @type {string} имя игры или файла для сохранения
     */
    this.name = name;

    /**
     * @type {Player} проигрыватель
     */
    this.Player = {};

    /**
     * @type {Quest} хранилище файла квеста
     */
    this.Quest = {};

    /**
     * @type {number}
     */
    this.position = 0;

    /**
     * @type {string}
     */
    this.realCurrentLoc = "";
  }

  /**
   *
   */
  init(msg) {
    this.Quest = new Quest(msg);

    this.clean();
  }

  /**
   * @param {string} name
   * @param {number|string} count
   */
  addItem(name, count) {
    return this.setItem(name, this.getItem(name) + parseInt(count));
  }

  /**
   * @param {string} name
   * @param {number|string} count
   */
  removeItem(name, count) {
    return this.setItem(name, this.getItem(name) - parseInt(count));
  }

  /**
   *
   * @param {string} name
   * @param {number|string} count
   */
  setItem(name, count) {
    count = parseInt(count);

    if (count <= 0) {
      delete this.items[name];
      this.setVar(name, 0);
    } else {
      this.items[name] = count;
      this.setVar(name, count);
    }
  }

  /**
   * @param {string} name
   * @return {number}
   */
  getItem(name) {
    return this.items[name] === undefined ? 0 : this.items[name];
  }

  /**
   * @param {string} variable
   * @param {*} value
   */
  setVar(variable, value) {
    variable = variable.toLowerCase();

    if (this.systemVars[variable] !== undefined) {
      this.systemVars[variable] = value;
    } else {
      if (variable.startsWith("inv_")) {
        variable = variable.substr(4);

        this.setItem(variable, value);
      } else {
        this.vars[variable] = value;
      }
    }
  }

  /**
   * @param {string} variable
   * @returns {*}
   */
  getVar(variable) {
    variable = variable.toLowerCase();

    if (this.systemVars[variable] !== undefined) {
      return this.systemVars[variable];
    }

    if (variable.startsWith("inv_")) {
      variable = variable.substr(4);
    }

    if (variable === "rnd") {
      return Math.random();
    } else if (variable.startsWith("rnd")) {
      return Math.floor(Math.random() * parseInt(variable.substr(3))) + 1;
    }

    if (variable === "time") {
      const date = new Date();
      return (
        date.getHours() * 3600 +
        date.getMinutes() * 60 +
        date.getSeconds()
      );
    }

    // Для выражений вроде "1 деньги"
    if (variable.split(" ").length > 1) {
      const count = variable.split(" ")[0];
      if (!isNaN(count)) {
        variable = variable
          .split(" ")
          .slice(1)
          .join(" ")
          .trim();
        return this.vars[variable] >= count;
      }
    }

    if (this.vars[variable] !== undefined) {
      return this.vars[variable];
    }

    return 0;
  }

  /**
   * перезапуск
   */
  restart() {
    this.clean();
  }

  /**
   * очистка
   */
  clean() {
    this.Player = new Player(this);
    this.Player.Quest = this.Quest;

    this.vars = {
      tokens_delim: ' ,"?!'
    };

    this.realCurrentLoc = this.Quest.firstLabel;
    this.setVar("current_loc", this.Quest.firstLabel);
    this.setVar("previous_loc", this.Quest.firstLabel);

    this.position = 0;
    this.items = {};
  }

  /**
   * сохранение
   */
  save() {
    return {
      status: this.Player.status,
      text: this.Player.text,
      buttons: this.Player.buttons,
      items: this.items,
      vars: this.vars,
      position: this.position,
      realCurrentLoc: this.realCurrentLoc
    };
  }

  /**
   * загрузка
   */
  load(data) {
    this.Player.status = data.status;
    this.Player.text = data.text;
    this.Player.buttons = data.buttons;
    this.items = data.items;
    this.vars = data.vars;
    this.position = data.position;
    this.realCurrentLoc = data.realCurrentLoc;
  }

  /**
   *
   */
  isLocked() {
    return this.locked;
  }

  setMode(mode) {
    if (mode === "ripurq") {
      ModeUrqRip(Player);
    }
    if (mode === "dosurq") {
      ModeUrqDos(Player);
      this.setVar("style_backcolor", "#000");
      this.setVar("style_textcolor", "#FFF");
    }
  }
}
