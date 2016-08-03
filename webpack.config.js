module.exports = {
  entry: "./public/scripts/fcc_game_of_life.jsx",
  output: {
    filename: "./public/build/bundle.js"
  },
 module: {
   loaders: [
     {
       test: /\.jsx$/,
       exclude: /node_modules/,
       loader: 'babel-loader',
       query: { 
         presets: ['react', 'es2015'] 
       }
     }
   ]
 },
 resolve: {
   extensions: ['', '.js', '.jsx']
 },
}
