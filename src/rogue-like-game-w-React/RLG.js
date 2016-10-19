import React from 'react';

var settings = {
    worldWidth: 100,
    worldHeight: 100,
};

var RLGContainer = React.createClass({
    getInitialState(){
        // Keep all game state in this container. All other components will be pure (only properties passed from here).
        return {
            world: getNewWorld(),
            entities: getEntities(1,1,1,1),
        }
    },
    render(){
        <World array={this.state.world}>
            {entities}
        </World>
    },
    move(direction){
        let newLoc = Object.assign({}, this.location);
        switch (direction){
            case 'N':
                newLoc.y += 1;
                break;
            case 'S':
                newLoc.y -= 1;
                break;
            case 'E':
                newLoc.x += 1;
                break;
            case 'W':
                newLoc.x -= 1;
                break;
            default:
                break;
        }
        if (canMove(newLoc)) this.location = newLoc;
    }
});

/*
* Returns a 2d array with each value representing a square that can be occupied by a thing.
 */
function getNewWorld(){
    let newWorld = [];
    for (var x = 0; x < settings.worldWidth; x++) {
        newWorld[x] = [];
        for (var y = 0; y < settings.worldHeight; y++) {
            newWorld[x][y] = 1;
        }
    }
    return newWorld;
}

function getEntities(healthPacks, enemies, weapons, portals){
    var newThings = {};
    for(let i = 0; i < healthPacks; i++){
        let name = 'health-' + i;
        newThings[name](new Thing({
            location: {x: 22, y:22},
            attack: 0,
            health: 20,
            type: 'health'
        }))
    }
    for(let i = 0; i < enemies; i++){
        let name = 'enemy-' + i;
        newThings[name](new Thing({
            location: {x: 44, y:44},
            attack: 5,
            health: 20,
            type: 'enemy'
        }))
    }
    for(let i = 0; i < weapons; i++){
        let name = 'weapon-' + i;
        newThings[name](new Thing({
            location: {x: 66, y:66},
            attack: 20,
            health: 0,
            type: 'weapon'
        }))
    }
    for(let i = 0; i < portals; i++){
        let name = 'portal-' + i;
        newThings[name](new Thing({
            location: {x: 88, y:88},
            attack: 0,
            health: 0,
            type: 'portal'
        }))
    }
}

class Thing {
    constructor({location, attack, health, type}){
        Object.assign(this, {location, attack, health, type})
    }
}







