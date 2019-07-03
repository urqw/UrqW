export default function set(Player) {
  /**
   * следующая строка
   */
  Player.prototype.next = function() {
    let line = this.Quest.get(this.Game.position);

    this.Game.position++;

    // вырезать комментарий
    if (line.includes(";")) {
      line = line.substring(0, line.indexOf(";"));
    }

    if (!line) {
      return false;
    }

    return line.replace(/\t/g, " ");
  };

  /**
   * прыгнуть на метку
   *
   * @param {string} labelName
   * @param {string} type
   */
  Player.prototype.goto = function(labelName, type) {
    const label = this.Quest.getLabel(labelName);

    if (label) {
      if (type !== "proc") {
        this.Game.realCurrentLoc = label.name;
      }

      // TODO конcтанты
      if (type === "btn") {
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
  };

  return Player;
}
