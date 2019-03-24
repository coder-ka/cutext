const Cutext = require('../lib');

const {
  expect
} = require('chai');

describe('test', () => {
  const src = `# title**titlebold**
> inyodeyansu
>> **inyobold**desu


`;

  it('render()', async () => {
    const cutext = new Cutext();

    const cutters = cutext
      .addCutter({
        name: 'test cutter 1',
        regex: /^(#+)\s+(.+)[\r\n]*/,
        parse([p1, p2]) {
          return {
            level: p1.length,
            text: p2
          }
        },
        render({
          level, text
        }) {
          expect(level).to.equal(1);
          expect(text).to.equal('title**titlebold**');

          return 'header**bold**';
        },
      })
      .addChainsaw({
        name: 'test cutter 2',
        regex: /^(>+)\s(.+)[\r\n]*/,
        parse([p1, p2]) {
          return {
            indent: p1.length,
            text: p2
          }
        },
        process(txt) {
          return txt.replace(/\*\*(.+)\*\*/, '<bold>')
        },
        render(asts) {
          expect(asts).to.eql([{
            indent: 1,
            text: 'inyodeyansu'
          }, {
            indent: 2,
            text: '<bold>desu'
          }])

          return 'blockquote**bold**';
        },
        multiple: true
      });

    expect(cutters.render(src)).to.equal('header**bold**blockquote**bold**');

    expect(cutters.compile(src)).to.eql([
      {
        name: "test cutter 1",
        token: {
          level: 1,
          text: "title**titlebold**"
        }
      },
      {
        name: "test cutter 2",
        token: [
          {
            indent: 1,
            text: "inyodeyansu"
          },
          {
            indent: 2,
            text: "<bold>desu"
          }
        ]
      }
    ]);
  })

  it('another pattern.', () => {
    const Cutext = require('../lib');

    const cutext = new Cutext();

    const cutters = cutext.addCutter({
      name: 'hoge cutter',
      regex: /(hoge)/,
      parse([text]) {
        return text;
      },
      render(hoges) {
        return hoges.join('&');
      },
      multiple: true
    });

    expect(cutters.compile('hogehogehogehugahogehoge')).to.eql([
      // Continuous three hoge. 
      {
        name: 'hoge cutter',
        token: ['hoge', 'hoge', 'hoge']
      },
      // Not matched string. name is undefined.
      {
        token: 'huga'
      },
      // Continuous two hoge.
      {
        name: 'hoge cutter',
        token: ['hoge', 'hoge']
      }
    ]);

    expect(cutters.render('hogehogehogehugahogehoge')).to.equal('hoge&hoge&hogehoge&hoge');
  })
})