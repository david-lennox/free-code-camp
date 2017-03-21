/**
 * The basic input unit for the application.
 */

import React from 'react';

var About = React.createClass({
    render() {
        return (
            <div>
                <h1>React Experiments</h1>
                <p>Process for creating an experiment...</p>
                <div id="apiContent"></div>
                <input type="text" value={name}/>
            </div>
        )
    },
    componentDidMount(){
        var URL = `http//localhost:9039/api/Account/Register`;
        fetch(URL,{
            Email: 'fatty@fattyfat.com',
            Password: 'few%445*Ag',
            ConfirmPassword: 'few%445*Ag'
        }).then(function(res) {
            handleResponse(res);
        });

        function handleResponse(data){
            debugger;
            localStorage.setItem('AppToken', JSON.stringify(data.token));
            console.log(data);
        }
    }
});


export default About;