import React from 'react';
//import $ from 'jquery';

import './leaderboard.css'

var Row = React.createClass({
    render: function(){
        return <tr><td>{this.props.name}</td><td><img className="avatar" alt={this.props.name} src={this.props.imgurl} /></td><td>{this.props.recent}</td><td>{this.props.total}</td></tr>
    }
});

var Leaderboard = React.createClass({
    getInitialState: function(){
        return {leaderboardRows: [], sortBy: 'total', reverseOrder: true}
    },
    getUsers: function(){
        //this.setState({leaderboardRows: getFakeData()});  // Use this to avoid API calls
        var self = this;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://fcctop100.herokuapp.com/api/fccusers/top/recent');
        xhr.send(null);
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4) {
                if (xhr.status === 200) self.setState({leaderboardRows: JSON.parse(xhr.responseText) })
            }
        };

        // jQuery version of the above ajax request is much easier but we don't want jQuery just for that.
        // $.getJSON("https://fcctop100.herokuapp.com/api/fccusers/top/recent", function(users){
        //     self.setState({leaderboardRows: users});
        // });
    },
    componentWillMount: function(){
        this.getUsers();
    },

    sortByRecent: function(){
        if(this.state.sortBy === "recent") this.toggleReverse();
        else this.setState({sortBy: 'recent', reverseOrder: true});
    },

    sortByTotal: function(){
        if(this.state.sortBy === "total") this.toggleReverse();
        else this.setState({sortBy: 'total', reverseOrder: true});
    },

    toggleReverse: function(){this.setState({reverseOrder: this.state.reverseOrder === false})},

    render: function() {
        var sortBy = this.state.sortBy;
        var reverse = this.state.reverseOrder;
        var ordered = this.state.leaderboardRows.sort(function(user1, user2){
            if(sortBy === "total"){
                if(reverse) return user2.alltime - user1.alltime;
                else return user1.alltime - user2.alltime;
            }
            else {
                if(reverse) return user2.recent - user1.recent;
                else return user1.recent - user2.recent;
            }
        });
        var rows = ordered.map(function(user){
            return <Row name={user.username} imgurl={user.img} recent={user.recent} total={user.alltime} key={user.username} />
        });
        return (
            <div>
                <h1>Free Code Camp Leaderboard</h1>
                <table className="table">
                    <thead>
                    <tr>
                        <th>User</th>
                        <th>Picture</th>
                        <th onClick={this.sortByRecent}>Pts last 30 days</th>
                        <th onClick={this.sortByTotal}>Total Score</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});

// if rendering directly into the DOM (e.g. in a codepen.io pen) uncomment following ReactDOM.render call.
// ReactDOM.render(
//     <Leaderboard />,
//     document.getElementById('content')
// );

// if rendering directly into the DOM (e.g. in a codepen.io pen) comment out the following line.
export default Leaderboard;
