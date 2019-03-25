module.exports = class Cutter {
    /**
     * constructor
     * 
     * @param {Object} param param
     * @param {string} param.name cutter name
     * @param {RegExp} [param.startWith] startWith
     * @param {RegExp} param.regex regex
     * @param {function(string): string} [param.process] process
     * @param {function(string[], *): *} [param.parse] parse
     * @param {function(*, *): string} [param.render] render method for rendering cut words.
     * @param {boolean} [param.multiple] multiple or not.
     */
    constructor({
      name,
      startWith,
      regex,
      process,
      parse,
      render,
      multiple
    }) {
      this.name = name;
      this.startWith = startWith;
      this.regex = regex;
      this.process = process || (txt => txt);
      this.parse = parse || (matched => matched);
      this.render = render || (arg => JSON.stringify(arg));
      this.multiple = multiple;
    }
  
    /**
     * cut method.
     * 
     * @param {string} src src
     * @param {Cutext} cutext cutext instance
     * @param {*} arg additional argument
     */
    cut(src, cutext, arg) {
      let result;
  
      if (
        (this.startWith ? this.startWith.test(src) : true) &&
        (result = this.regex.exec(src))
      ) {
        return {
          unmatched: src.slice(0, result.index),
          token: this.parse.call(cutext, result.slice(1).map(this.process.bind(cutext)), arg),
          remaining: src.slice(result.index + result[0].length),
        }
      } else {
        return null;
      }
    }
  }