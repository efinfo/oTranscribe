const io = require('socket.io-client');
const ss = require('socket.io-stream');
const localStorageManager = require('local-storage-manager');
const fs = require('fs');

const SERVER_SOCKET = 'http://127.0.0.1:3000';

class Socket{
  constructor(server){
    if(!!Socket.instance){
      console.log("Socket exists!", Socket.instance);
      return Socket.instance;
    }
    console.log("Not existing socket creating it...");
    Socket.instance = this;

    let endpoint = server || SERVER_SOCKET;
    this.socket = io(endpoint);
    this.socket.on('connect', () => {
      console.info("Constuctor socket:", this.socket.id);
    });

    return this;
  }
  listen(event, cb) {
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

  setTranscriptionChunks(){
    let setTranscription = (transcriptions) => {
      console.log("I heard 'transcriptions'",transcriptions);
      localStorageManager.setItem('transcriptions', transcriptions);
    }
    this.listen('transcriptions', setTranscription);
  }

  splitInChunks(filename){
    this.socket.emit('split-in-chunks', {filename: filename});
    let transcribeChunks = () => {
      this.socket.emit('transcribe-chunks');
      this.setTranscriptionChunks();
    }
    this.listen('chunks', transcribeChunks);
  }

  convertMpeg2Wav(filename){
    this.socket.emit('convert-mpeg2wav', {filename: filename});
  }

  streamVideoAudio(file){
    console.log("streaming video...", file);
    console.log("this.socket", this.socket);
    var start = new Date();
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
        var end = new Date() - start;
        console.info('Execution time: %ds', end/1000);
        // this.getNonSilentIntervals(filename);
        // this.splitInChunks(filename);
        // this.transcribeChunks();
        this.convertMpeg2Wav(filename);
      }
      // -> e.g. '42%'
    });

    blobStream.pipe(stream);
  }

  googleTranscribeAsync(filename){
    console.log("Emitting google-transcribe-async", filename);
    this.socket.emit('google-transcribe-async', {filename: filename});
    //let transcribeChunks = () => {
      //this.socket.emit('transcribe-chunks');
      //this.setTranscriptionChunks();
    //}
    let setTranscription = (transcriptions) => {
      console.log("I heard 'transcriptions'",transcriptions);
      localStorageManager.setItem('transcriptions', transcriptions);
    }
    this.listen('transcriptions', setTranscription);
  }

};

module.exports = Socket;
