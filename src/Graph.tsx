import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement{
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.

      // Add more Perspective configurations here.
      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference
      elem.load(this.table);
      // Data should be visualized as a continuous line graph ('y_line')
      elem.setAttribute('view', 'y_line');
      // Distinguishes stock ABC from DEF using 'stock' as the value
      elem.setAttribute('column-pivots', '["stock"]');
      // Handles x-axis and allows us to map each datapoint based on timestamp
      elem.setAttribute('row-pivots', '["timestamp"]');
      // Allows us to focus on a particular part of a stock's data. In this case, top_ask_price
      elem.setAttribute('columns', '["top_ask_price"]');
      // Enables us to handle the duplicated data and consolidate it into a single data point
      elem.setAttribute('aggregates', `
        {"stock" : "distinct count",
        "top_ask_price" : "avg",
        "top_bid_price" : "avg",
        "timestamp" : "distinct count"}`);
    }
  }
}

export default Graph;
