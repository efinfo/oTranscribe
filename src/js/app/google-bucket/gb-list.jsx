import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';
import {transcribeVideoAudio} from '../transcription';

function getVideos() {
  let videos = [];
  const savedGoogleBucketVideos = localStorageManager.getItem('google-bucket-videos');
  if (savedGoogleBucketVideos) {
    videos = Object.assign({}, {videos: savedGoogleBucketVideos});
  }
  return videos;
}

function GBListRow(props) {
  let video = props.video;
  let metadata = video.metadata;
  let name = metadata.name;
  let k = Math.pow(1024, 2);
  let size = metadata.size / k;

  console.log("Row", video);
  return(
    <tr>
    <td>
    <div class="custom-control custom-checkbox">
    <input type="checkbox" class="custom-control-input" id="customCheck1" checked />
    <label class="custom-control-label" for="customCheck1">1</label>
    </div>
    </td>
    <td>{name}</td>
    <td>Cristina</td>
    <td>{size}</td>
    <td>
    <button onClick={() => transcribeVideoAudio(name)}>Transcripción</button>
    </td>
    </tr>
  );
}

function GBListRows(props) {
  let videos = props.videos;
  let allVideos = videos.map(v => {
    return <GBListRow video={v} />;
  });
  return(<div>{allVideos}</div>);
}


class GBList extends Component {
    constructor (props) {
      super(props);
      this.state = getVideos();
    }
    render() {
      console.log("Rendering", this.state);
      return(<GBListRows videos={this.state.videos} />)
    }
}

export function showVideos(el) {
  render(<GBList />, el, el.lastChild);
}
