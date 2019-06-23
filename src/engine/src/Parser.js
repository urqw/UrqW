import Expression from "./RPN";
import { isFloat } from "./tools";

export default class Parser {
  constructor(Player) {
    /**
     * @type {Player} проигрыватель
     */
    this.Player = Player;
  }

  /**
   *
   * @param line
   */
  parse(line) {
    line = line.replace(/^\s+/, "");
    // просмотреть список известных операторов
    var expl = line.split(" ");
    var operand = expl[0].toLowerCase().trim();
    var command = expl.slice(1).join(" ");

    if (operand == "if") {
      var cond = line.substring(
        line.indexOf("if ") + 3,
        line.indexOf(" then ")
      );

      var then;
      var els;
      var ifline = line;

      // todo переделать на обратную польскую
      if (ifline.indexOf(" if ") != -1) {
        ifline = ifline.substring(0, ifline.indexOf(" if ") + 1);
      }

      if (ifline.indexOf(" else ") == -1) {
        then = line.substring(line.indexOf(" then ") + 6);
        els = false;
      } else {
        then = line.substring(
          line.indexOf(" then ") + 6,
          line.indexOf(" else ")
        );
        els = line.substring(line.indexOf(" else ") + 6);
      }

      var conditionResult = new Expression(
        this.openTags(cond),
        this.Player.Game
      ).calc();

      if (conditionResult === true || conditionResult > 0) {
        this.parse(then);
      } else {
        if (els) {
          this.parse(els);
        }
      }

      return;
    } else if (operand == "btn") {
      var xbtn = command.split(",");

      if (xbtn.length > 1) {
        var desc = this.prepareLine(
          xbtn
            .slice(1)
            .join(",")
            .trim()
        );
        var com = xbtn[0].trim();

        if (com.indexOf("&") == -1) {
          com = this.openTags(com);
        }

        return this.Player.btn(com, desc);
      }
    }

    //todo
    line = this.prepareLine(line);
    expl = line.split(" ");
    operand = expl[0].toLowerCase().trim();
    command = expl.slice(1).join(" ");

    if (operand[0] == ":") return;

    switch (operand) {
      case "save":
        return this.Player.Game.save("fast");
      case "image":
        return this.Player.image(command.toString().trim());
      case "music":
        return this.Player.playMusic(command.toString().trim(), false);
      case "play":
        if (this.Player.volume == 3) {
          return;
        }

        var Sound;
        if (this.Player.Game.files === null) {
          Sound = new Audio(
            "quests/" + this.Player.Game.name + "/" + command.toString().trim()
          );
        } else {
          Sound = new Audio(this.Player.Game.files[command.toString().trim()]);
        }

        Sound.volume = this.Player.volume == 1 ? 1 : 0.5;
        Sound.play();

        break;
      case "clsb":
        return this.Player.clsb();
      case "cls":
        return this.Player.cls();
      case "forget_procs":
        return this.Player.forgetProcs();
      case "proc":
        return this.Player.proc(command.toString().trim());
      case "end":
        return this.Player.end();
      case "anykey":
        return this.Player.anykey(command.toString().trim());
      case "pause":
        return this.Player.pause(parseInt(command));
      case "input":
        return this.Player.input(command.toString().trim());
      case "quit":
        return this.Player.quit();
      case "invkill":
        return this.Player.invkill(
          command.toString().trim().length > 0
            ? command.toString().trim()
            : null
        );
      case "perkill":
        return this.Player.perkill();
      case "inv-":
        var item = command.split(",");
        var quantity = 1;
        if (item.length > 1) {
          quantity = parseInt(item[0]);
          item = item[1];
        }

        return this.Player.invRemove(item.toString().trim(), quantity);
      case "inv+":
        item = command.split(",");
        quantity = 1;
        if (item.length > 1) {
          quantity = parseInt(item[0]);
          item = item[1];
        }

        return this.Player.invAdd(item.toString().trim(), quantity);
      case "goto":
        return this.Player.goto(command.toString().trim(), "goto");
      case "p":
      case "print":
        return this.Player.print(this.openLinks(command), false);
      case "pln":
      case "println":
        return this.Player.print(this.openLinks(command), true);
      case "btn":
        var btn = command.split(",");

        return this.Player.btn(
          btn[0].trim(),
          btn
            .slice(1)
            .join(",")
            .trim()
        );
      //рудименты далее
      case "tokens":
        var reg;

        if (this.Player.Game.getVar("tokens_delim") === "char") {
          reg = "";
        } else {
          reg = new RegExp(
            "[" +
              this.Player.Game.getVar("tokens_delim").replace(
                /[-[\]{}()*+?.,\\^$|#\s]/g,
                "\\$&"
              ) +
              "]",
            "gi"
          );
        }

        var str = (new Expression(command.trim()), this.Player.Game)
          .calc()
          .split(reg);

        this.Player.setVar("tokens_num", str.length);

        for (var i = 0; i < str.length; i++) {
          this.Player.setVar("token" + (i + 1), str[i]);
        }

        break;
      case "instr":
        line = command;

        if (line.indexOf("=") > 0) {
          this.Player.setVar(
            line.substring(0, line.indexOf("=")).trim(),
            new Expression(
              "'" + line.substr(line.indexOf("=") + 1) + "'",
              this.Player.Game
            ).calc()
          );
        }

        // no break here
        break;

      // если ничего не помогло^w^w^w не оператор
      default:
        //  это выражение?
        if (line.indexOf("=") > 0) {
          this.Player.setVar(
            line.substring(0, line.indexOf("=")).trim(),
            new Expression(
              line.substr(line.indexOf("=") + 1),
              this.Player.Game
            ).calc()
          );
        } else {
          console.log(
            "Unknown operand: " + operand + " ignored (line: " + line + ")"
          );
        }
    }
  }

  /**
   * Разбиваем по &
   *
   * @param line
   *
   * @returns {String}
   */
  prepareLine(line) {
    var pos = line
      .replace(/\[\[.+?\]\]/g, function(exp) {
        return exp.replace(/\&/g, " ");
      })
      .indexOf("&");

    if (pos != -1) {
      this.Player.flowAdd(line.substring(pos + 1));
      line = line.substring(0, pos).replace(/^\s+/, "");
    }

    return this.openTags(line);
  }

  /**
   * Открываем #$, #%$
   *
   * @param {String} line
   *
   * @returns {String}
   */
  openTags(line) {
    line = line.replace(/\#\/\$/g, "<br>");
    line = line.replace(/\#\%\/\$/g, "<br>");
    line = line.replace(/\#\$/g, " ");
    line = line.replace(/\#\%\$/g, " ");

    // ##$
    line = line.replace(/\#\#[^\#]+?\$/g, function(exp) {
      return "&#" + exp.substr(2, exp.length - 3) + ";";
    });

    while (line.search(/\#[^\#]+?\$/) != -1) {
      line = line.replace(/\#[^\#]+?\$/, exp => {
        // рудимент для совместимости
        if (exp[1] == "%") {
          exp = exp.substr(2, exp.length - 3);
        } else {
          exp = exp.substr(1, exp.length - 2);
        }
        var result = new Expression(exp, this.Player.Game).calc();

        return isFloat(result) ? result.toFixed(2) : result;
      });
    }

    return line;
  }

  /**
   * @param {String} line
   *
   * @returns {String}
   */
  openLinks(line) {
    while (line.search(/\[\[.+?\]\]/) != -1) {
      line = line.replace(/\[\[.+?\]\]/, exp => {
        var text;
        var command;
        exp = exp.substr(2, exp.length - 4);

        if (exp.indexOf("|") > 0) {
          var exptmp = exp.split("|");
          command = exptmp
            .slice(1)
            .join("|")
            .trim();
          text = exptmp[0].trim();
        } else {
          command = exp.trim();
          text = exp;
        }

        return this.Player.Client.convertToLink(
          text,
          this.Player.link(command)
        );
      });
    }

    return line;
  }
}
