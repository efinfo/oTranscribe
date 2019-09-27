import {
  h,
  render,
  Component
} from 'preact';
import ReactDOM from 'react-dom';
import ReactDataGrid from 'react-data-grid';

class Subtitle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: props.rows,
      columns: props.columns
    }
  };

  onGridRowsUpdated = ({
    fromRow,
    toRow,
    updated
  }) => {
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = {
          ...rows[i],
          ...updated
        };
      }
      return {
        rows
      };
    });
  };
  render(props, state) {
    return ( <
      ReactDataGrid columns = {
        this.state.columns
      }
      rowGetter = {
        i => this.state.rows[i]
      }
      rowsCount = {
        this.state.rows.length
      }
      onGridRowsUpdated = {
        this.onGridRowsUpdated
      }
      enableCellSelect = {
        true
      }
      cellRangeSelection = {
        {
          onStart: args => console.log(this.state.rows),
          onUpdate: args => console.log(this.state.rows),
          onComplete: args => console.log(this.state.rows)
        }
      }
      />
    );
  }
}

export function showSubtitle(el, rows, columns, rowRenderer) {
  render( < Subtitle rows = {
      rows
    }
    columns = {
      columns
    }
    />, el);
  }
