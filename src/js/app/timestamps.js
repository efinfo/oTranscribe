import {getPlayer} from './player/player';
import {showSubtitle} from './subtitle.jsx';

const $ = require('jquery');
const localStorageManager = require('local-storage-manager');

import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';
import React from 'react';

function getTime(){
    // get timestamp
    const player = getPlayer();
    let time = 0;
    if (player) {
        time = player.getTime();
    }

    return {
        formatted: formatMilliseconds(time),
        raw: time
    };
};

function getLength(){
  const player = getPlayer();
  let time = 0;
  if(player){
    time = player.getLength();
  }

  return {
    formatted : formatMilliseconds(time),
    raw: time
  };
}

// TODO: This is passing to the backend and will be deprecated
function formatMilliseconds(time) {
    const timeSeconds = Math.floor(time / 1000);
    const hours = Math.floor(timeSeconds / 3600).toString();
    const minutes = ("0" + Math.floor(timeSeconds / 60) % 60).slice(-2);
    const seconds = ("0" + Math.floor( timeSeconds % 60 )).slice(-2);
    let formatted = minutes+":"+seconds;
    if (hours !== '0') {
        formatted = hours + ":" + minutes + ":" + seconds;
    }
    formatted = formatted.replace(/\s/g,'');
    return formatted;
}

// http://stackoverflow.com/a/25943182
function insertHTML(newElement) {
    var sel, range;
    if (window.getSelection && (sel = window.getSelection()).rangeCount) {
        range = sel.getRangeAt(0);
        range.collapse(true);
        range.insertNode(newElement);

        // Move the caret immediately after the inserted span
        range.setStartAfter(newElement);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

var Timestamp = React.createClass({
    render: function() {
      let ts = this.props.tm;
      return <span class="timestamp" contenteditable="false" data-timestamp={`${ts.raw}`}> {ts.formatted}</span>;
    }
});


function timestampFormatter({value}){
   return <Timestamp tm={value}/>;
}


function setSubtitle(rows, columns){
  const textbox = document.getElementById('textbox');
  $(this).text(showSubtitle(textbox, rows, columns));
}

function getNonSilentIntervals(){
  let intervals = (localStorageManager.getItem('nonsilent-intervals'))['nonsilent'][0];
  return intervals;
}

function insertTimestampIntervals(){

  let rows = [];
  const columns = [
    { key: "timestamp_begin", name: "timestamp_begin", editable: false, width: "25%", formatter: timestampFormatter},
    { key: "timestamp_end", name: "timestamp_end", editable: false, width: "25%", formatter: timestampFormatter},
    { key: "subtitle", name: "Subtitle", editable: true, width: "50%" }
  ];

  //let nonSilentIntervals = getNonSilentIntervals();
  let transcriptions = getTranscriptions();

  //console.log("nonSilentIntervals: ", nonSilentIntervals);
  console.log("transcriptions: ", transcriptions);

  let subtitles = [];

  for(let i = 0; i < transcriptions.length - 1; i++){
    let current = transcriptions[i];
    let re1 = /Transcript\:/;
    if(re1.exec(current)){
      let transcription = current.split("Transcript: ")[1];
      current = transcriptions[++i];
      let ts = current.split('Time: ')[1];
      let re = /[0-9]{1,}\.[0-9]{1,}/;
      let res = re.exec(ts);
      if(res){
        ts = parseFloat(res[0]);
        console.log(ts);
      }else{
        ts = 0;
      }
      let s = {
        timestamp_begin: {formatted: formatMilliseconds(ts), raw: Math.floor(ts/1000)},
        timestamp_end: {formatted: '', raw: ''},
        subtitle: transcription
      };
      rows.push(s);
    }
  }

  /*
  nonSilentIntervals.forEach( interval => {
    let f_b = {formatted: formatMilliseconds(interval[0]), raw: Math.floor(interval[0]/1000)};
    let f_e = {formatted: formatMilliseconds(interval[1]), raw: Math.floor(interval[1]/1000)};
    rows.push({timestamp_begin: f_b, timestamp_end: f_e, subtitle: ''});
  });
  */

  setSubtitle(rows, columns);
  activateTimestamps();
}

function insertTimestamp(){
    var time = getTime();
    if (time) {
        const space = document.createTextNode("\u00A0");
        insertHTML(createTimestampEl(time));
        insertHTML(space);
        activateTimestamps();
    }
}

function createTimestampEl(time) {
    const timestamp = document.createElement('span');
    timestamp.innerText = time.formatted;
    timestamp.className = 'timestamp';
    timestamp.setAttribute('contenteditable', 'false');
    timestamp.setAttribute('data-timestamp', time.raw);
    return timestamp;
}

function activateTimestamps(){
    Array.from(document.querySelectorAll('.timestamp')).forEach(el => {
        el.contentEditable = false;
        el.removeEventListener('click', onClick);
        el.addEventListener('click', onClick);
    });
}

function onClick() {
    const player = getPlayer();
    var time = this.dataset.timestamp;
    if (player) {
        if (typeof time === 'string' && time.indexOf(':') > -1) {
            // backwards compatibility, as old timestamps have string rather than number
            player.setTime(convertTimestampToSeconds(time));
        } else {
            player.setTime( time );
        }
    }
}

// backwards compatibility, as old timestamps use setFromTimestamp() and ts.setFrom()
window.setFromTimestamp = function(clickts, element){
    window.ts.setFrom(clickts, element);
}
window.ts = {
    setFrom: function(clickts, element){
        const player = getPlayer();
        var time = this.dataset.timestamp;
        if (player && element.childNodes.length == 1) {
            player.setTime( convertTimestampToSeconds(time) );
        }
    }
}

function convertTimestampToSeconds(hms) {
    var a = hms.split(':');
    if (a.length === 3) {
        return ((+a[0]) * 60 * 60) + (+a[1]) * 60 + (+a[2]);
    }
    return (+a[0]) * 60 + (+a[1]);
}

export {
  activateTimestamps,
  insertTimestamp,
  convertTimestampToSeconds,
  formatMilliseconds,
  insertTimestampIntervals,
  Timestamp
};
