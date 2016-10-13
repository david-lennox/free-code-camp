import React, { Component } from 'react'
import { Link } from 'react-router';
import '../../node_modules/bootstrap/dist/css/bootstrap.css';
import '../../css_libraries/font-awesome/css/font-awesome.min.css';

import './Home.css'

// Todo: Have an array of FCC exercise metadata that populates a bunch of ContentRow items.

class ContentRow extends Component {
    render() {

    }
}


class Home extends Component {
  render() {
        return (
          <div className="Home">
            <table className="table">
                <tbody>
                <tr>
                  <td><Link to="/about">About</Link></td>
                  <td>The about page explains how this experiment application works.</td>
              </tr>
              <tr>
                  <td><Link to="/weather">FCC Weather App</Link></td>
                  <td>The Weather App includes an ajax call using jQuery</td>
              </tr>
                <tr>
                    <td><Link to="/leaderboard">FCC Leaderboard App</Link></td>
                    <td>Queries the Github API and presents list of top users. Currently uses jQuery.</td>
                </tr>
                <tr>
                    <td><Link to="/recipes">FCC Recipe App</Link></td>
                    <td>Add Recipes and display them.</td>
                </tr>
                <tr>
                    <td><Link to="/wikiSearch">Wiki Search App</Link></td>
                    <td>Add Recipes and display them.</td>
                </tr>
                <tr>
                    <td><Link to="/calculator">Calculator App</Link></td>
                    <td className="urgent">INCOMPLETE!</td>
                </tr>
                </tbody>
            </table>

              {this.props.children}

          </div>
        )
  }
}
export default Home
