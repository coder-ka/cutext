const Cutter = require('./cutter');

module.exports = class Cutext {
  /**
   * constructor
   * 
   * @param {Object} options options
   * @param {function(*[]): string} [options.noPattermMatchedRenderer] noPattermMatchedRenderer
   */
  constructor(options) {
    options = options || {};

    /**
     * @type {Cutter[]}
     */
    this.cutters = [];

    this.noPattermMatchedCutter = new Cutter({
      regex: /([^])/,
      parse([str]) {
        return str;
      },
      render: options.noPattermMatchedRenderer || (str => '')
    });
  }

  /**
   * add cutter.
   * @param {Cutter} cutter cutter
   */
  addCutter(cutter) {
    this.cutters.push(new Cutter(cutter));

    return this;
  }

  /**
   * add chainsaw.
   * alias for addCutter({...cutter, multiple: true})
   * 
   * @param {Cutter} cutter cutter
   */
  addChainsaw(chainsaw) {
    this.addCutter({
      ...chainsaw,
      multiple: true,
    })

    return this;
  }

  /**
   * compile method
   * 
   * @param {string} src target source.
   * @param {*} arg additional argument.
   */
  compile(src, arg) {
    let compiled = [], noPatternMatchedString = '';

    while (src !== '') {

      let matched = false;

      for (const cutter of this.cutters) {

        let once = false, result, tokens = [], unmatchedString = '';

        while (!once && (result = cutter.cut(src, this, arg))) {
          if (noPatternMatchedString !== '') {
            compiled.push({
              token: noPatternMatchedString,
            });
          }

          const {
            token,
            remaining,
            unmatched
          } = result;

          if (unmatched !== '') {
            unmatchedString = unmatched;
            src = src.slice(unmatchedString.length);
            break;
          }

          tokens.push(token);

          src = remaining;

          once = !cutter.multiple;

          matched = true;
        }

        if (matched) {
          compiled.push({
            name: cutter.name,
            token: cutter.multiple ? tokens : tokens[0]
          });

          if (unmatchedString) {
            compiled.push({
              token: unmatchedString
            })
          }

          break;
        }
      }

      if (!matched) {
        noPatternMatchedString += src[0];
        src = src.slice(1);
      }
    }

    if (noPatternMatchedString !== '') {
      compiled.push({
        token: noPatternMatchedString,
      });
    }

    return compiled;
  }

  /**
   * render method
   * 
   * @param {string} src target source.
   * @param {*} arg additional argument.
   */
  render(src, arg) {
    let rendered = '', noPatternMatchedString = '';

    while (src !== '') {

      let matched = false;

      for (const cutter of this.cutters) {

        let once = false, result, tokens = [], unmatchedString = '';

        while (!once && (result = cutter.cut(src, this, arg))) {
          if (noPatternMatchedString !== '') {
            rendered += this.noPattermMatchedCutter.render.call(this, noPatternMatchedString, arg);
          }

          const {
            token,
            remaining,
            unmatched
          } = result;

          if (unmatched !== '') {
            unmatchedString = unmatched;
            src = src.slice(unmatchedString.length);
            break;
          }

          tokens.push(token);

          src = remaining;

          once = !cutter.multiple;

          matched = true;
        }

        if (matched) {
          rendered += cutter.render.call(this, cutter.multiple ? tokens : tokens[0], arg);

          if (unmatchedString) {
            rendered += this.noPattermMatchedCutter.render.call(this, unmatchedString, arg);
          }

          break;
        }

        if (tokens.length !== 0) {


          break;
        }
      }

      if (!matched) {
        noPatternMatchedString += src[0];
        src = src.slice(1);
      }
    }

    if (noPatternMatchedString !== '') {
      rendered += this.noPattermMatchedCutter.render.call(this, noPatternMatchedString, arg);
    }

    return rendered;
  }
}