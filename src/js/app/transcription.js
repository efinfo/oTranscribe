import ReactDOMServer from "react-dom/server";

import {getPlayer} from './player/player';
import viewController from './view-controller';
import {setEditorContents} from './texteditor';
import {Timestamp} from './timestamps';

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

function listFilesInBucket(){
  console.log("listFilesInBucket");
  axios.get('http://localhost:3000/api/v1/video?type=all').then(videosRes => {
    console.log("videos", videosRes);
    if(videosRes.data.success){
      localStorageManager.setItem('google-bucket-videos', videosRes.data.video);
    }
    $('.start').removeClass('ready');

    viewController.set('googleBucket');
  }).catch(err => console.log(err));
}
// It assumes that transcription is in the local storage (getTranscriptions)
function setGoogleTranscription(){
  let transcriptions = getTranscriptions();
  $('.start').removeClass('ready');
  viewController.set('editor');
  //$('.textbox-container').style.display = 'block';
  /*const textbox = document.getElementById('textbox');
  $(this).text(transcriptionText);
  $(this).forceUpdate();*/
  let text = '';

  for (let current of transcriptions){
    let tsBegin = current.timestamp_begin;
    let tsEnd = current.timestamp_end;

    let b = ReactDOMServer.renderToString(<Timestamp tm={tsBegin} />);
    let e = ReactDOMServer.renderToString(<Timestamp tm={tsEnd} />);
    console.log(b);
    let header = `<p>${b} - ${e} Interlocutor</p>`;
    console.log(header);
    let t = current.transcription;
    text = text + header + "</br>" + t;
  }

  setEditorContents(text);
}

function getTranscriptions(){
  let transcriptions = (localStorageManager.getItem('transcriptions'));
  return transcriptions;
}

export {
  getFilesInBucket,
  transcribeVideoAudio,
  setGoogleTranscription,
  listFilesInBucket
};
