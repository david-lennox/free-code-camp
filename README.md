# Instructions

This application is a simple React app without Redux. It includes all the
Free Code Camp exercises that can be completed without Redux. It uses
react-router to produce a list of components (exercises and experiments)
in a table. Each sub-folder of src contains one React component with
styling. Where an exercise does not require React (e.g. D3 Chart), it is
still placed inside a React component for the purpose of consistency of 
the routing pattern.

## To add a component:

  1. Add the sub-folder to source and create someExercise.js (which 
   exports the React component) and someExercise.css (which is imported 
   into someExercise.js) and possibly a data file such as someExerciseData.json.
  2. Import the component and add the route to Index.js.
  3. Add the component to home/contentSummaryData.js, from which the 
  Table of Contents in Home.js is built.

## To start developing

just install the dependencies if required: `npm install` 

Then start the development server: `npm start`.  
 
The application is bootstrapped with the **create-react-app** tool. See 
details and instructions online. 