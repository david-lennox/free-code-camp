import React from 'react';
import $ from 'jquery';
import '../../node_modules/weather-icons/css/weather-icons.min.css';

var apiId = "4b5b363b9217c53df50903d81473758e";

export default React.createClass({
    changeTempScale: function(){
        this.setState({scale: this.state.scale === "celcius" ? "farenheight" : "celcius"})
    },
    updateData: function() {
        $.ajax({
            dataType: "Json",
            context: this,
            url: "http://api.openweathermap.org/data/2.5/weather",
            data: this.state.city === "your location" ?
            {lat: this.state.lat, lon: this.state.lon, appid: apiId} :
            {q: this.state.city, appid: apiId},
            success: function(result){
                console.log(JSON.stringify(result));
                var precip = result.rain ? result.rain[Object.keys(result.rain)[0]] + "mm in " + Object.keys(result.rain)[0]: 0;
                this.setState({
                    tempC: result.main.temp -273.15,
                    tempF: result.main.temp * 9/5 - 459.67,
                    rain: precip,
                    lat: result.coord.lat,
                    lon: result.coord.lon,
                    weatherIcon: result.main.temp > 295 ? 'wi wi-day-sunny' : 'wi wi-day-cloudy',
                    rainIcon: result.rain ? 'wi wi-rain' : ''
                });
            }
        });
    },
    getInitialState: function() {
        return {lat: null, lon: null, city: 'your location', tempC: '', tempF: '', rain: '', cityField: '', scale: "celcius"};
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
        this.setState({cityField: '', city: newCity}, this.updateData);
    },
    handleCityFieldChange: function(e) {
        this.setState({cityField: e.target.value});
    },

    render: function() {
        return (
            <div className="weatherBox">
                <h1>Weather in {this.state.city} <i className={this.state.weatherIcon}></i> <i className={this.state.rainIcon}></i></h1>
                <table className="table">
                    <tbody>
                    <tr>
                        <td>Temperature</td>
                        <td>{this.state.scale === "celcius" ?
                            Math.round((this.state.tempC * 10)/10) :
                            Math.round((this.state.tempF * 10)/10)}
                            &nbsp;{this.state.scale} &nbsp;&nbsp;
                            <span onClick={this.changeTempScale}
                                  style={{fontSize: '10px', cursor: 'pointer'}}>
                                Change to {this.state.scale === "celcius" ? "farenheight" : "celcius"}
                                </span>
                        </td>
                    </tr>
                    <tr>
                        <td>Rainfall</td><td>{this.state.rain}</td>
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
            </div>
        );
    }
});
