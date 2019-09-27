import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import React, {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';


class Upload extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
      {({getRootProps, getInputProps}) => (
        <section>
        <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
    </section>
  )}
  </Dropzone>
    );
  }
}

export function uploadSetup(el='upload') {
  render(<Upload />, el);
  }
