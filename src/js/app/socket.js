var io = require('socket.io-client');
var ss = require('socket.io-stream');
var fs = require('fs');

const SERVER_SOCKET = 'http://127.0.0.1:3000';
class Socket{
  constructor(server){
    if(!!Socket.instance){
      return Socket.instance;
    }
    Socket.instance = this;
    let endpoint = server || SERVER_SOCKET;
    this.socket = io(endpoint);
    return this;
  }
  listen(event, cb){
    this.socket.on(event, cb);
  }

  getSilenceIntervals(filename){
    this.socket.emit('detect-silences', {filename: filename});
    let saveSilenceIntervals = (intervals) => {
      console.log(intervals);
      this.setState({ silence_intervals: intervals });
    };
    this.listen('silences', saveSilenceIntervals);
  }

  streamVideoAudio(file){
    console.log("streaming video...", file);
    console.log("this.socket", this.socket);
    var filename = file.name;
    var stream = ss.createStream();
    console.log("Stream:", stream);
    ss(this.socket).emit('video-audio', stream, {name: filename});
    var blobStream = ss.createBlobReadStream(file);
    var size = 0;
    var percentage = 0;

    blobStream.on('data', (chunk) => {
      size += chunk.length;
      percentage = Math.floor(size / file.size * 100);
      console.log(percentage + '%');
      if(percentage == 100){
        console.log("Finished");
        this.getSilenceIntervals(filename);
      }
      // -> e.g. '42%'
    });

    blobStream.pipe(stream);
  }
};

module.exports = Socket;
