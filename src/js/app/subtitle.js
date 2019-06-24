import { h, render, Component } from 'preact';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';

const columns = [
  { key: "id", name: "ID", editable: true },
  { key: "title", name: "Title", editable: true },
  { key: "complete", name: "Complete", editable: true }
];

const rows = [
  { id: 0, title: "Task 1", complete: 20 },
  { id: 1, title: "Task 2", complete: 40 },
  { id: 2, title: "Task 3", complete: 60 }
];

class Subtitle extends Component {
  state = { rows };

  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };
  render(props, state) {
    return (
      <ReactDataGrid
        columns={columns}
        rowGetter={i => this.state.rows[i]}
        rowsCount={3}
        onGridRowsUpdated={this.onGridRowsUpdated}
        enableCellSelect={true}
        cellRangeSelection={{
          onStart: args => console.log(rows),
          onUpdate: args => console.log(rows),
          onComplete: args => console.log(rows)
        }}
      />
    );
  }
}

export function showSubtitle(el) {
    render(<Subtitle />, el);
}
