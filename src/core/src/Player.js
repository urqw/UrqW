import Parser from "./Parser";
import Client from "./Client";
import { dosColorToHex, intColorToRgb } from "./tools";

export default class Player {
  constructor(Game) {
    /**
     * @type {Quest} хранилище файла квеста
     */
    this.Quest = null;
    /**
     * @type {Client} Клиент
     */
    this.Client = null;
    /**
     * @type {Game} состояние игры
     */
    this.Game = Game;

    /**
     * @type {number}
     */
    this.position = 0;

    this.Parser = new Parser(this);

    this.text = [];
    this.buttons = [];
    this.links = [];
    this.inf = false;
    this.timer = null;

    this.procPosition = [];

    this.flow = 0;
    this.flowStack = [];
    this.flowStack[this.flow] = [];
  }

  continue() {
    this.play();

    this.fin();
  }

  /**
   * рендер
   */
  fin() {
    if (this.Game.getVar("music")) {
      this.playMusic(this.Game.getVar("music"), true);
    }

    if (this.status !== Player.PLAYER_STATUS_NEXT) {
      this.Client.render();
    }

    this.Game.locked = !(
      this.status === Player.PLAYER_STATUS_END ||
      this.status === Player.PLAYER_STATUS_PAUSE
    );
  }

  play(line) {
    this.Game.locked = true;

    this.status = Player.PLAYER_STATUS_NEXT;

    if (line !== undefined) {
      this.Parser.parse(line);
    }

    while (this.status === Player.PLAYER_STATUS_NEXT) {
      if (
        this.flowStack[this.flow].length === 0 &&
        (line = this.next()) !== false
      ) {
        this.Parser.parse(line);
      }

      while (
        this.flowStack[this.flow].length > 0 &&
        this.status === Player.PLAYER_STATUS_NEXT
      ) {
        this.Parser.parse(this.flowStack[this.flow].pop());
      }
    }
  }

  /**
   * следующая строка
   */
  next() {
    let line = this.Quest.get(this.Game.position);

    this.Game.position++;

    if (!line) {
      return false;
    }

    return line.replace(/\t/g, " ");
  }

  /**
   * добавление команды в текущий поток
   *
   * @param {String} line
   */
  flowAdd(line) {
    this.flowStack[this.flow].push(line);
  }

  /**
   * команды далее исполняются юзером по ходу игры
   */

  common() {
    var commonLabel = "common";

    if (this.Game.getVar("common") !== 0) {
      commonLabel = commonLabel + "_" + this.Game.getVar("common");
    }

    if (this.proc(commonLabel)) {
      this.forgetProcs();
      this.play();
    }
  }

  /**
   * @param {int} actionId
   * @param {boolean} [link]
   */
  action(actionId, link = false) {
    let command;
    if (link) {
      command = this.links[actionId];
      this.links[actionId] = null;
    } else {
      for (let key in this.buttons) {
        if (this.buttons[key].id === actionId) {
          command = this.buttons[key].command;
          delete this.buttons[key];

          break;
        }
      }
    }

    if (command === null) {
      return;
    }

    const label = this.Quest.getLabel(command);

    if (label) {
      this.btnAction(label.name);
    } else {
      this.xbtnAction(command);
    }
  }

  /**
   * @param {String} labelName
   * @returns {boolean}
   */
  btnAction(labelName) {
    this.cls();

    this.common();

    if (this.goto(labelName, "btn")) {
      this.continue();
    }
  }

  /**
   * @param {String} command
   * @returns {boolean}
   */
  xbtnAction(command) {
    this.common();

    this.play(command + "&end");
    this.fin();
  }

  useAction(labelName) {
    this.play("proc " + labelName + "&end");
    this.fin();
  }

  /**
   * @param {String} keycode
   * @returns {boolean}
   */
  anykeyAction(keycode) {
    if (this.inf.length > 0) {
      this.Game.setVar(this.inf, keycode);
    }

    this.continue();
  }

  /**
   * @param {String} value
   * @returns {boolean}
   */
  inputAction(value) {
    this.Game.setVar(this.inf, value);

    this.continue();
  }

  setVar(variable, value) {
    variable = variable.trim();

    if (variable.toLowerCase() === "style_dos_textcolor") {
      this.Game.setVar("style_textcolor", dosColorToHex(value));
    }

    if (variable.toLowerCase() === "image") {
      // todo переместить

      let file = value;
      if (this.Game.files != null) {
        if (this.Game.files[value] !== undefined) {
          file = value;
        } else if (this.Game.files[value + ".png"] !== undefined) {
          file = value + ".png";
        } else if (this.Game.files[value + ".jpg"] !== undefined) {
          file = value + ".jpg";
        } else if (this.Game.files[value + ".gif"] !== undefined) {
          file = value + ".gif";
        }
      }

      this.image(file);
    }

    this.Game.setVar(variable, value);
  }

  /**
   * @param {String} src
   */
  image(src) {
    if (src && this.Game.files[src]) {
      this.text.push({
        img: this.Game.files[src]
      });
    }
  }

  /**
   * @param {String} src
   * @param {boolean} loop
   */
  playMusic(src, loop) {
    let file;

    if (this.Game.files === null) {
      file = "quests/" + this.Game.name + "/" + src;
    } else {
      file = this.Game.files[src];
    }

    if (src) {
      if (Client.gameMusic.getAttribute("src") !== file) {
        Client.gameMusic.src = file;

        if (loop) {
          Client.gameMusic.addEventListener(
            "ended",
            function() {
              Client.gameMusic.src = file;
              Client.gameMusic.play();
            },
            false
          );
        }

        Client.gameMusic.play();
      }
    } else {
      Client.gameMusic.pause();
    }
  }

  /**
   * прыгнуть на метку
   *
   * @param {string} labelName
   * @param {string} type
   * @return boolean
   */
  goto(labelName, type) {
    const label = this.Quest.getLabel(labelName);

    if (label) {
      // TODO конcтанты
      if (type !== "proc") {
        this.Game.realCurrentLoc = label.name;
      }

      if (type === "btn" || type === "goto") {
        this.Game.setVar("previous_loc", this.Game.getVar("current_loc"));
        this.Game.setVar("current_loc", labelName);
      }

      if (type === "btn" || type === "goto" || type === "proc") {
        this.Game.setVar(
          "count_" + label.name,
          this.Game.getVar("count_" + label.name) + 1
        );
      }

      this.Game.position = label.pos;

      // весь стек что дальше очищается
      this.flowStack[this.flow] = [];

      return true;
    }

    return false;
  }

  /**
   * удаление переменных
   */
  // TODO: move to Game
  perkill() {
    this.Game.vars = {};

    Object.entries(this.Game.items, ([index, value]) => {
      // TODO: for..of
      this.Game.setVar(index, parseInt(value));
    });
  }

  cls() {
    this.text = [];
    this.buttons = [];
    this.links = [];

    this.Client.render();
  }

  clsb() {
    this.buttons = [];
    this.links = [];

    this.text = Client.removeLinks(this.text);

    this.Client.render();
  }

  // TODO: move to Game
  invkill(item) {
    if (item != null) {
      this.Game.setItem(item, 0);
    } else {
      for (const key of Object.keys(this.Game.items)) {
        this.Game.setItem(key, 0);
      }
    }
  }

  /**
   * прок
   *
   * @param {String} label
   */
  proc(label) {
    this.flow++;
    this.procPosition.push(this.Game.position);

    if (this.goto(label, "proc")) {
      this.flowStack[this.flow] = [];
      return true;
    } else {
      this.flow--;
      this.procPosition.pop();
      return false;
    }
  }

  end() {
    if (this.procPosition.length > 0) {
      this.flowStack[this.flow].pop();
      this.Game.position = this.procPosition.pop();
      this.flow--;
    } else {
      this.flowStack[this.flow] = [];
      this.status = Player.PLAYER_STATUS_END;
    }
  }

  forgetProcs() {
    this.flowStack[0] = this.flowStack[this.flow];
    this.procPosition = [];
    this.flow = 0;
  }

  /**
   * @param {String} inf
   */
  anykey(inf) {
    this.inf = inf;
    this.status = Player.PLAYER_STATUS_ANYKEY;
  }

  /**
   * @param {int} milliseconds
   */
  pause(milliseconds) {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.status = Player.PLAYER_STATUS_PAUSE;

    this.timer = setTimeout(() => {
      if (this.status === Player.PLAYER_STATUS_PAUSE) {
        this.continue();
      }
    }, milliseconds);
  }

  /**
   * @param {String} inf
   */
  input(inf) {
    this.inf = inf;
    this.status = Player.PLAYER_STATUS_INPUT;
  }

  quit() {
    this.status = Player.PLAYER_STATUS_QUIT;
  }

  /**
   * @param {String} item
   * @param {int} quantity
   */
  invRemove(item, quantity) {
    this.Game.removeItem(item, quantity);
  }

  /**
   * @param {String} item
   * @param {int} quantity
   */
  invAdd(item, quantity) {
    this.Game.addItem(item, quantity);
  }

  /**
   * @param {String} text
   * @param {boolean} ln
   */
  print(text, ln) {
    let color = null;
    const styleTextColor = this.Game.getVar("style_textcolor");
    if (isNaN(styleTextColor)) {
      color = styleTextColor;
    } else if (styleTextColor > 0) {
      color = intColorToRgb(styleTextColor);
    }

    this.text.push({
      text,
      ln,
      color
    });
  }

  /**
   * @param {String} command
   * @param {String} desc
   */
  btn(command, desc) {
    const id = this.buttons.length;

    this.buttons.push({
      id,
      command,
      desc
    });
  }

  /**
   * @param {String} text
   * @param {String} command
   */
  link(text, command) {
    const id = this.links.length;

    this.links[id] = command;

    return Client.generateLink(text, id);
  }

  /**
   * Стиль
   */
  style() {
  }

  static PLAYER_STATUS_NEXT = 0;
  static PLAYER_STATUS_END = 1;
  static PLAYER_STATUS_ANYKEY = 2;
  static PLAYER_STATUS_PAUSE = 3;
  static PLAYER_STATUS_INPUT = 4;
  static PLAYER_STATUS_QUIT = 5;
}
