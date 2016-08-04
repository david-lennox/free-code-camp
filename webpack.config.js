module.exports = {
  entry: "./scripts/fcc_game_of_life.jsx",
  output: {
    path: "./public/build",
    publicPath: "/public/build/",
    filename: "bundle.js"
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
