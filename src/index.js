import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import Shell from './shell/Shell';
import Home from './home/Home';
import WeatherApp from './weather/WeatherApp';
import Leaderboard from './leaderboard/LeaderboardApp';
import RecipeApp from './recipe/RecipeApp';
import WikiSearch from './wikiSearch/WikiSearch';
import Calculator from './calculator/Calculator';
import D3Chart from './d3chart/D3Chart';
import GameOfLife from './game-of-life/GameOfLife';
import GameOfLifeD3Table from './game-of-life-d3-table/GameOfLifeD3Table';
import RLG from './rogue-like-game-w-React/RLG';
import Pomodoro from './pomodoro/Pomodoro';
import TTT from './tictactoe/TTT';
import SimonGame from './simon-game/SimonGame';

import About from './about/About';
import './index.css';

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={Shell}>
            <IndexRoute component={Home}/>
            <Route path="/about" component={About}/>
            <Route path="/weather" component={WeatherApp}/>
            <Route path="/leaderboard" component={Leaderboard}/>
            <Route path="/recipes" component={RecipeApp}/>
            <Route path="/wikiSearch" component={WikiSearch}/>
            <Route path="/calculator" component={Calculator}/>
            <Route path="/d3chart" component={D3Chart}/>
            <Route path="/game-of-life" component={GameOfLife}/>
            <Route path="/game-of-life-d3-table" component={GameOfLifeD3Table}/>
            <Route path="/rogue-like-game" component={RLG}/>
            <Route path="/pomodoro" component={Pomodoro}/>
            <Route path="/tictactoe" component={TTT}/>
            <Route path="/simon-game" component={SimonGame}/>
        </Route>
    </Router>,
  document.getElementById('root')
);
