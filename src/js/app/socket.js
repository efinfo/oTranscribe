var io = require('socket.io-client');
var ss = require('socket.io-stream');
var fs = require('fs');

const SERVER_SOCKET = 'http://127.0.0.1:5000';
class Socket{
  constructor(server){
    let endpoint = server || SERVER_SOCKET;
    this.socket = io(endpoint);
  }
  listen(event, cb){
    this.socket.on(event, cb);
  }
  streamVideoAudio(filename){
    var stream = ss.createStream();
    ss(this.socket).emit('video-audio', stream, {name: filename});
    fs.createReadStream(filename).pipe(stream);
  }
};

module.exports = Socket;
