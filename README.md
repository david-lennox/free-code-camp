# Instructions

This application is a simple React app without Redux. It includes all the
Free Code Camp exercises that can be completed without Redux. It uses
react-router to produce a list of components (exercises and experiments)
in a table. 

Each sub-folder of src contains one React component with
scss styling. Where an exercise does not require React (e.g. D3 Chart), 
it is still placed inside a React component for the purpose of consistency 
of the routing pattern.

## To add a component:

  1. Add the sub-folder to source and create someExercise.js (which 
    exports the React component) and someExercise.scss from which someExercise.css
    will be auto-generated by the background sass conversion. If required 
    and a data file such as someExerciseData.json.
  2. Import the component and add the route to Index.js.
  3. Add the component to home/contentSummaryData.js, from which the 
  Table of Contents in Home.js is built.

## To start developing

just install the dependencies if required: `npm install` 

Then start the development server: `npm start`.  

And start the SCSS watch process: `sass --watch G:\Code\Tutorials\FreeCodeCamp`
 
The application is bootstrapped with the **create-react-app** tool. See 
details and instructions online. 

## Bugs and Roadblocks

### Warning regarding "controlled" checkbox

Warning: [someInputComponent] is changing a controlled input of type checkbox to be uncontrolled. Input elements should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://fb.me/react-controlled-components.

This Warning appears to be displayed because the checkbox in question is fully controlled, receiving its value as a prop from the parent component, and also receiving the function that changes it. 

The problem was caused by the value attribute being set to "undefined" under certain conditions. The Warning was not helpful.