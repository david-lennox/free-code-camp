export default
[
    {
        link: '/about',
        title: 'About Page',
        description: 'The about page explains how this experiment application works.',
        completion: 100
    },
    {
        link: '/weather',
        title: 'Weather App',
        description: 'The Weather App includes an ajax call using jQuery.',
        completion: 100
    },
    {
        link: '/leaderboard',
        title: 'Leaderboard App',
        description: 'Queries the Github API and presents list of top users. Currently uses jQuery.',
        completion: 100
    },
    {
        link: '/wikiSearch',
        title: 'Wiki Search',
        description: 'Search using the Wikipedia API and present the results.',
        completion: 100
    },
    {
        link: '/recipes',
        title: 'Recipe App',
        description: 'Add Recipes and display them.',
        completion: 100
    },
    {
        link: '/calculator',
        title: 'Simple Calculator',
        description: 'A basic calculator. Could improve styling and remove use of eval(), which is considered to be bad practice.',
        completion: 100
    },
    {
        link: '/d3chart',
        title: 'D3 Bar Chart',
        description: 'Simple bar chart using svg rectangles and the D3 library. Inserted into a very basic React component, which does nothing except render a div and then the D3 chart is built and inserted in the React component `componentDidMount()` method.',
        completion: 80
    },
    {
        link:'/game-of-life',
        title: 'Game Of Life using React',
        description: 'A React component that tracks the game state as a state property, which is an object containing a property for each cell. A version that used a 2d array for the game state was a little slower. Most time consuming thing appears to be rendering the divs to the page.',
        completion: 100
    },
    {
        link:'/game-of-life-d3-table',
        title: 'Game Of Life using D3 and HTML Table Element',
        description: 'This version is about 4 x faster than the React Only version for the largest game board.',
        completion: 100
    }
]