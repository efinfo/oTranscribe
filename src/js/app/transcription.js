import {getPlayer} from './player/player';
import {showSubtitle} from './subtitle.jsx';
const $ = require('jquery');
const localStorageManager = require('local-storage-manager');
const axios = require('axios');

import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';
import React from 'react';
import Socket from './socket';
//Must be a singleton
var socket = new Socket();

function transcribeVideoAudio(video){
  socket.googleTranscribeAsync(video);
}

function getFilesInBucket(){
  axios.get('http://localhost:3000/api/v1/video').then(videos => {
    let filename = videos.data.video[4].name;
    console.log("My file", filename);
    transcribeVideoAudio(filename);
    //return videos;
  }).catch( err => console.log(err));
  //console.log(videos);

}
export {getFilesInBucket, transcribeVideoAudio};
