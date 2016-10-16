import React, { Component } from 'react'
import { Link } from 'react-router';
import tocData from './contentSummaryData';

import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../css_libraries/font-awesome/css/font-awesome.min.css';

import './Home.css'

// Todo: Have an array of FCC exercise metadata that populates a bunch of ContentRow items.

// Table of Contents (TOC) Row
class TOCRow extends Component {
    render() {
        const {title, description, link} = this.props.item;
        return <tr><td><Link to={link}>{title}</Link></td><td>{description}</td></tr>
    }
}

class Home extends Component {
  render() {

      let tocRows = tocData.map(c => <TOCRow key={c.title} item={c}/>);
        return (
          <div className="Home">
            <table className="table">
                <tbody>
                {tocRows}
                </tbody>
            </table>

              {this.props.children}

          </div>
        )
  }
}
export default Home
