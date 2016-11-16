import React, { Component } from 'react'
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../css_libraries/font-awesome/css/font-awesome.min.css';

class Shell extends Component {
  render() {
      let shellStyle = {
          margin: "25px"
      };
        return (
          <div style={shellStyle}>
              <h1>Header Content Might Go Here</h1>
              {this.props.children}
          </div>
        )
  }
}
export default Shell;
