Cutext is a parsing tool created for simple use in Node.

# Installation

```bash
$ npm install --save cutext
```

# Example

This is an example for rendering a header in markdown.

```javascript
const Cutext = require('cutext');

const cutext = new Cutext();

// Add a new Cutter rule
const cutters = cutext.addCutter({
  // Name of Cutter.It is used to identify compiled tokens.
  name: 'header cutter',
  // A regular expression to extract the header.
  regex: /^(#+) (.+)/,
  // An array of strings matching the regular expression is passed.
  parse([p1, p2]) {
    return {
      level: p1.length,
      text: p2
    }
  },
  // Object is passed parsed above.
  render({ level, text }) {
    return `<h${level}>${text}</h${level}>`;
  }
});

// Compile the string and create an object.
console.log(cutters.compile('# title'));
// output:
// [{ name: 'header cutter', token: { level: '1', text: 'title' }}]

// You can also render string and output it.
console.log(cutters.render('# title'));
// output:
// <h1>title</h1>
```

# Cutext Constructor

example:

```javascript
new Cutext({
  noPattermMatchedRenderer(str) {
    console.log('no pattern matched: ', str);

    // Display strings in upper case.
    return str.toUpperCase();
  }
});
```

### **noPattermMatchedRenderer**: `function(string): string`

**default**: `str => ''`

By default, strings that do not match the regular expression are ignored by the rendering process.

To change the behavior, specify `noPattermMatchedRenderer` option.


# Cutter Constructor

example:
```javascript
new Cutter({
  name: 'cutter name',
  startWith: /^aaa/,
  regex: /^aaa([^]+)bbb/m,
  parse() { ... },
  process() { ... },
  render() { ... },
  multiple: false
});
```

### **name**: `string` [optional]

**default**: `undefined`

Name of cutter.

Use for identify compiled tokens.

---

### **startWith**: `RegExp` [optional]

**default**: `undefined`

It is mainly used when /m flag is used.

`/^aaa([^]+)bbb/m` match below text.

```
other text
aaa
some text
bbb
```

Specify `startWith: /^aaa/` to avoid ignoring other text.

---

### **regex**: `RegExp`

Cutter will cut the first string that matches the specified regular expression.

The start position of the string `/^/` changes every time it is cut.

---

### **process**: `function(string):string` [optional]

**default**: `txt => txt`

To transform only matched string.

e.g. sanitization.

`this` context is instance of Cutext.

---

### **parse**: `function(string[]):*` [optional]

**default**: `matched => matched`

Parse string and create object.
A result array of `RegExp.exec().slice(1)` is passed.

`this` context is instance of Cutext.

---

### **render**: `function(*):string` [optional]

**default**: `obj => JSON.stringify(obj)`

Render object created in parse method to string.
Array of Matched string is passed without parse method.

`this` context is instance of Cutext.

---

### **multiple**: `boolean` [optional]

**default**: `false`

You can handle continuous matched string as array.

For example, three parsing will be occured and render method will be called each times for string following:

```
hogehogehoge
```

If you specify `multiple: true`

```javascript
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

console.log(cutters.compile('hogehogehogehugahogehoge'));
// output:
// [
//   // Continuous three hoge. 
//   {
//     name: 'hoge cutter',
//     token: ['hoge', 'hoge', 'hoge']
//   },
//   // Not matched string. name is undefined.
//   {
//     token: 'huga'
//   },
//   // Continuous two hoge.
//   {
//     name: 'hoge cutter',
//     token: ['hoge', 'hoge']
//   }
// ]

// 'huga' is ignored.And Continuous 'hoge' are joined by '&'
console.log(cutters.render('hogehogehogehugahogehoge'));
// output:
// 'hoge&hoge&hogehoge&hoge'
```

# Cutext Mehtods

### **addCutter**: `function(Cutter):Cutext`

Add Cutter rule to cutext object.

---

### **addChainsaw**: `function(Cutter):Cutext`

Alias for `addCutter({...option, multiple: true})`

---
