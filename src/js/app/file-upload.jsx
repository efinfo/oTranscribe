import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import React, {useCallback} from 'react';
import axios from 'axios';

const $ = require('jquery');

class FileUpload extends Component {

  constructor(props) {
    super(props);
      this.state = {
        uploadStatus: false
      }
    this.showFile = this.showFile.bind(this);
  }


  showFile(event) {
    var preview = document.getElementById('show-text');
    var file = event.target.files[0];

    //var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader()

    var textFile = /text.*/;

    if (file.type.match(textFile)) {
      reader.onload = function (event) {
        preview.innerHTML = event.target.result;
      }
    } else {
      preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
    }
    reader.readAsText(file);
  }

  render() {
    return(
      <div class="upload-wrapper">
      <header>
         <input type="file" onChange={ (event) => this.showFile(event) } />
      </header>
      <div id="show-text"></div>
      </div>
    )
  }
}

export function uploadSetup() {
  const textbox = document.getElementById('textbox');
  $(this).text(render(<FileUpload />, textbox));
  }
