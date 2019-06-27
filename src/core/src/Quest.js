/**
 * @author narmiel
 */

export default class Quest {
  /**
   * @param {string} text тело игры
   */
  constructor(text) {
    /**
     * @type {Object}
     */
    this.labels = {};

    /**
     * @type {Object}
     */
    this.useLabels = {};

    /**
     * @type {string[]}
     */
    this.quest = text
      .replace(/^[\n\r]+|[\n\r]+$/g, "")
      .replace(/\/\*[\s\S.]+?\*\//g, "")
      .split(/[\n\r]+/);

    this._init();
  }

  /**
   * @private
   */
  _init() {
    /**
     * Собираем метки
     */
    let label = "";

    for (let i = this.quest.length - 1; i >= 0; i--) {
      const line = this.get(i);

      if (line.substr(0, 1) === "_" && line.substr(1, 1) !== "_") {
        this.quest[i - 1] = this.quest[i - 1] + line.substr(1);
        this.quest[i] = "";
      } else if (line.substr(0, 1) === ":") {
        label = line
          .substr(1)
          .toLowerCase()
          .trim();

        if (line.substr(0, 5).toLowerCase() === ":use_") {
          this.useLabels[label] = i;
        }

        this.labels[label] = i;
      }
    }

    this.firstLabel = label;
  }

  /**
   * @param {String} label
   * @returns {object|boolean}
   */
  getLabel(label) {
    label = label.toString().toLowerCase();

    if (this.labels[label] !== undefined) {
      return {
        name: label,
        pos: this.labels[label]
      };
    } else {
      return false;
    }
  }

  /**
   * строка по номеру
   * @param {number} i
   * @returns {string|boolean}
   */
  get(i) {
    if (this.quest[i] !== undefined) {
      return this.quest[i];
    } else {
      return false;
    }
  }
}
