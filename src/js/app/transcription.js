import ReactDOMServer from "react-dom/server";
import { createPlayer, playerDrivers, getPlayer, isVideoFormat } from './player/player';
import { bindPlayerToUI, keyboardShortcutSetup} from './ui';
import viewController from './view-controller';
import {setEditorContents} from './texteditor';
import {Timestamp} from './timestamps';
import { inputSetup, getQueryParams, hide as inputHide } from './input';


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
const socket = new Socket();

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

function listFilesInWavFolder(){
  console.log("listFilesInWavFolder");
  axios.get('http://localhost:3000/api/v1/wav').then(res => {
    console.log(res);
    if(res.data.success){
      localStorageManager.setItem('wavFiles', res.data.wavFiles);
    }
    $('.start').removeClass('ready');
    viewController.set('wavFiles');
  }).catch(err => console.log(err));
}

// It assumes that transcription is in the local storage (getTranscriptions)
function setGoogleTranscription(video){
  let metadata = video.metadata;
  let name = metadata.name;
  let url = `https://${video.storage.apiEndpoint}/${metadata.bucket}/${metadata.name}`;
  console.log(url);

  let transcriptions = getTranscriptions();
  $('.start').removeClass('ready');

  inputHide();
  viewController.set('editor');

  createPlayer({
    driver: playerDrivers.HTML5_VIDEO,
    source: url
  }).then(() => {
    bindPlayerToUI();
  });

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
    let header = `<p>Interlocutor > ${b} - ${e}</p>`;
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
  listFilesInBucket,
  listFilesInWavFolder
};
