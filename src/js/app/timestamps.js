import {getPlayer} from './player/player';
import {showSubtitle} from './subtitle.jsx';
const $ = require('jquery');

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

function formatMilliseconds(time) {
    const hours = Math.floor(time / 3600).toString();
    const minutes = ("0" + Math.floor(time / 60) % 60).slice(-2);
    const seconds = ("0" + Math.floor( time % 60 )).slice(-2);
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
   return <Timestamp tm={value}/>
}

function setSubtitle(rows, columns){
  const textbox = document.getElementById('textbox');
  $(this).text(showSubtitle(textbox, rows, columns));
}

function insertTimestampIntervals(intervalSize){
  //Intervals of size 10 seconds by default
  let size = intervalSize ? intervalSize : 10;
  let interval = 0.0;
  const duration = getLength();
  let rows = [];
  const columns = [
    { key: "timestamp", name: "timestamp", editable: false, formatter: timestampFormatter},
    { key: "subtitle", name: "Subtitle", editable: true }
  ];

  while (interval <= (duration.raw - 10.00 )) {
    let f_i = {formatted: formatMilliseconds(interval), raw: interval};
    //let space = document.createTextNode("\u00A0");
    //insertHTML(createTimestampEl(f_i));
    rows.push({timestamp: f_i, subtitle: ''});
    //insertHTML(space);
    //let nl = document.createElement('br');
    //insertHTML(nl);
    interval = interval + size;
  }
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

export {activateTimestamps, insertTimestamp, convertTimestampToSeconds, formatMilliseconds, insertTimestampIntervals};
