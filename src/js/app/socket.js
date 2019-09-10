const io = require('socket.io-client');
const ss = require('socket.io-stream');
const localStorageManager = require('local-storage-manager');
const fs = require('fs');

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

  getNonSilentIntervals(filename){
    this.socket.emit('detect-nonsilent', {filename: filename});
    let saveNonSilentIntervals = (intervals) => {
      console.log(intervals);
      localStorageManager.setItem('nonsilent-intervals', intervals );
    };
    this.listen('nonsilent', saveNonSilentIntervals);
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
        this.getNonSilentIntervals(filename);
      }
      // -> e.g. '42%'
    });

    blobStream.pipe(stream);
  }
};

module.exports = Socket;
