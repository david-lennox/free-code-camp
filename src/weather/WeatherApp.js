import React from 'react';
import $ from 'jquery';
import FontAwesome from 'react-fontawesome';

var allowableCities = [
    {id: "x8", name: "Sydney"},
    {id: "x1", name: "Canberra"},
    {id: "x2", name: "Brisbane"},
    {id: "x3", name: "Melbourne"},
    {id: "x4", name: "New York"},
    {id: "x5", name: "Perth"},
    {id: "x6", name: "London"},
    {id: "x7", name: "Paris"}
];

var apiId = "4b5b363b9217c53df50903d81473758e";

// this.key is not used.
var City = React.createClass({
    render: function(){
        return <li className="city">{this.props.name}</li>
    }
});

export default React.createClass({
    changeTempScale: function(){
        this.setState({scale: this.state.scale === "celcius" ? "farenheight" : "celcius"})
    },
    updateData: function() {
        $.ajax({
            dataType: "Json",
            context: this,
            url: "http://api.openweathermap.org/data/2.5/weather",
            data: this.state.city === "unspecified" ?
            {lat: this.state.lat, lon: this.state.lon, appid: apiId} :
            {q: this.state.city, appid: apiId},
            success: function(result){
                console.log(JSON.stringify(result));
                var precip = result.rain ? result.rain['1h'] : 0;
                this.setState({
                    tempC: result.main.temp -273.15,
                    tempF: result.main.temp * 9/5 - 459.67,
                    rain: precip
                });
            }
        });
    },
    getInitialState: function() {
        return {lat: null, lon: null, city: 'unspecified', tempC: '', tempF: '', rain: '', cityField: '', scale: "celcius"};
    },
    componentDidMount: function() {
        // REMEMBER THE CONTEXT CHANGES WHEN WE ENTER A 3RD PARTY FUNCTION
        var self = this;
        console.log("componnetDidMount called...");
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                self.setState(
                    { lat: Math.round(position.coords.latitude),
                        lon: Math.round(position.coords.longitude)
                    },
                    self.updateData)
            });
        }
    },
    changeCity: function(e){
        console.log("handling submit...");
        e.preventDefault();
        var newCity =  this.state.cityField;
        if(!allowableCities.filter(function (city) {return city.name === newCity;})[0]) {
            alert("City must be chosen from the below list.");
            return;
        }
        this.setState({cityField: '', city: newCity}, this.updateData);

    },
    handleCityFieldChange: function(e) {
        this.setState({cityField: e.target.value});
    },

    render: function() {
        var allowableCityList = allowableCities.map(function(city){
            return (
                <City key={city.id} name={city.name} />
            )
        });
        return (
            <div className="weatherBox">
                <h1>Free Code Camp Weather App</h1>
                <table className="table">
                    <tbody>
                    <tr>
                        <td>City</td><td>{this.state.city}</td>
                    </tr>
                    <tr>
                        <td>Temperature</td>
                        <td>{this.state.scale === "celcius" ?
                            Math.round((this.state.tempC * 10)/10) :
                            Math.round((this.state.tempF * 10)/10)}
                            &nbsp;{this.state.scale} &nbsp;&nbsp;
                            <FontAwesome name="sun-o" />  &nbsp;&nbsp;
                            <span onClick={this.changeTempScale}  style={{fontSize: '10px', cursor: 'pointer'}}>Change to {this.state.scale === "celcius" ? "farenheight" : "celcius"} </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Rainfall</td><td>{this.state.rain}mm in the last 1 hour</td>
                    </tr>
                    <tr>
                        <td>longitude</td><td>{this.state.lon}</td>
                    </tr>
                    <tr>
                        <td>latitude</td><td>{this.state.lat}</td>
                    </tr>
                    </tbody>
                </table>
                <input type="text" value={this.state.cityField}
                       onChange={this.handleCityFieldChange}
                       placeholder="City Name" />
                <button className="button"
                        onClick={this.changeCity}>Change City</button>
                <br/>
                <h3>Allowable Cities</h3>
                <ul>
                    {allowableCityList}
                </ul>
            </div>
        );
    }
});
