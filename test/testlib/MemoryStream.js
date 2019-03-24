const {
  Readable,
  Writable
} = require('stream');

/**
 * Usage
 * 
 *   return new Promise((res, rej) => {
 *     const memoryWritable = new MemoryWritable();
 * 
 *     memoryWritable.on('finish', () => {
 *       res(memoryWritable.data);
 *     });
 * 
 *     memoryWritable.on('error', error => {
 *       rej(error);
 *     });
 * 
 *     const memoryReadable = new MemoryReadable(src);
 * 
 *     memoryReadable.on('error', error => {
 *       rej(error);
 *     });
 * 
 *     memoryReadable.pipe(markdownTransform).pipe(memoryWritable);
 *   });
 */

module.exports.MemoryWritable = class MemoryWritable extends Writable {
  constructor(cb) {
    super({});

    this.data = '';
    this.cb = cb;
  }

  _write(chunk, encoding, callback) {
    try {
      if (encoding === 'buffer') {
        chunk = chunk.toString('utf8');
      }

      this.data += chunk;

      callback();
    } catch (error) {
      callback(error, chunk);
    }
  }

  _final(callback) {
    callback();

    this.end();
  }
}

module.exports.MemoryReadable = class MemoryReadable extends Readable {
  constructor(data) {
    super({});

    this.byte = Buffer.from(data);

    this.length = 0;
    this.max = this.byte.length;

    this.emit('readable');

    this.setEncoding('utf8');
  }

  _read(length) {
    try {
      while(this.length < this.max) {
        const readLength = this.length + length;
  
        this.emit('data', this.byte.slice(this.length, readLength));
  
        this.length = readLength;
      }
  
      this.emitClose && this.emit('close');
  
      this.emit('end');
    } catch (error) {
      this.emit('error', error);
    }
  }
}