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

// this.key is not used.
var City = React.createClass({  
  render: function(){
    return <li className="city">{this.props.name}</li>
  }
});

var WeatherBox = React.createClass({
  changeTempScale: function(){
    if(this.state.scale === "celcius"){
      this.setState({scale:  "farenheight", temp: this.state.temp * 9/5 + 32 });
    }
    else{
      this.setState({scale: "celcius", temp: (this.state.temp - 32) * 5/9});
    } 
  },
  convertKelvin: function(temp){
    if(this.state.scale === "celcius") return temp - 273.15;
    else return temp * 9/5 - 459.67;
  },
  updateData: function(theCity) {
    $.ajax({
      dataType: "Json",
      context: this,
      url: "http://api.openweathermap.org/data/2.5/weather",
      data: {q: theCity, appid: "4b5b363b9217c53df50903d81473758e"},
      success: function(result){
        console.log(JSON.stringify(result));
        var precip = result.rain ? result.rain['1h'] : 0;
        this.setState({
          city: theCity, 
          temp: this.convertKelvin(result.main.temp), 
          rain: precip
        });
      }
    });
  },
  getInitialState: function() {
    return {city: 'Brisbane', temp: '', rain: '', cityField: '', scale: "celcius"};
  },
  componentDidMount: function() {
    console.log("componnetDidMount called...");
    this.updateData(this.state.city);
  },
  changeCity: function(e){
    console.log("handling submit...");
    e.preventDefault();
    var newCity =  this.state.cityField;
    if(!allowableCities.filter(function (city) {return city.name === newCity;})[0]) {
      alert("City must be chosen from the below list.");
      return;
    }
    this.setState({cityField: ''});
    this.updateData(newCity);
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
        <h1>Weather for {this.state.city}</h1>
        <h2>Temperature: {Math.round(this.state.temp * 10)/10} {this.state.scale}</h2>
        <button onClick={this.changeTempScale}>Change to {this.state.scale === "celcius" ? "farenheight" : "celcius"}</button>
        <h2>Rainfall: {this.state.rain}mm in the last 1 hour</h2>
        <h3>Change City</h3>
        <input type="text" value={this.state.cityField} onChange={this.handleCityFieldChange} />
          <button onClick={this.changeCity}>Change City</button>
          <h3>Allowable Cities</h3>
        <ul>
          {allowableCityList}
        </ul>
      </div>
    );
  }
});

ReactDOM.render(
  <WeatherBox apiUrl="theApiURl" />,
  document.getElementById('content')
);
