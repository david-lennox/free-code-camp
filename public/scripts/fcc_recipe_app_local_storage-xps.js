/**
 * LEARNING POINT
 * Keep most components as 'pure' meaning they have no state and just render the props passed down.
 * Previous version of this file tried to spread the State model across the RecipeBox, Recipe, and 
 * Ingredient classes. This is wrong. It should all be contained in the first because it is not 
 * possible to make a change to Ingredient that is not to be reflected in the RecipeBox. 
 * 
 * This app may be developed in a very similar way to the Kanban-App of the Apress Pro React book.
 * In particular have a look how that app creates the list of tasks in CheckList.js (chapter 4 version).
 * Note that a Task component is passed (as props) functions defined in the RecipeBox which expect a
 * taskId and a CardId. These equate to an ingredientId, and a RecipeId.
 * 
 * Note the method of 'binding' the context and the arguments to functions. So this is a way of passing
 * in the arguments without actually calling the function. The bind function returns a new function that 
 * will be called with the specified arguments.
 * 
 * DATA STRUCTURE:
 * The code is coupled to the data structure, which is described by example in getInitialRecipes().
 */

var Recipe = React.createClass({
    render: function(){

        var ingredients = this.props.recipe.ingredients.map(function(ingredient, index){
           return <li key={ingredient}>{ingredient}</li>
        });

        return (
            <div id={this.props.recipe.name} className='recipe'>
                <h3>{this.props.recipe.name}</h3>
                <ul className='ingredients'>{ingredients}</ul>
                <button onClick={this.props.deleteRecipe.bind(null, this.props.name)}>Delete</button>
            </div>
        )
    }
});

var RecipeBox = React.createClass({
    getRecipes: function(){
        // TODO - confirm received data is in the correct format.
        //this.setState({recipes: JSON.parse(localStorage.getItem("_dave004_recipes"))});
    },

    getInitialState: function(){
        return {recipes: {}, currentRecipe: ''}
    },

    componentWillMount: function(){
        var firstRecipes = this.getFirstRecipes();
        this.setState({recipes: firstRecipes})
    },

    render: function(){
        var self = this;
        if(this.state.recipes != null){
            var recipes = this.state.recipes.map(function(recipe){
                return (
                    <Recipe
                    key={recipe.name}
                    recipe={recipe}
                    deleteRecipe={self.deleteRecipe}/>
                )
            });
        }
        else var recipes = "No recipes in local storage";

        return (
            <div className="recipeBox">
            <h1>The Recipe Box</h1>
            <button onClick={this.addRecipe}>Add New</button>
            <h2>Recipes</h2>
            {recipes}
            </div>
        )
    },
    deleteRecipe: function(recipeIndex){
        var newList = this.state.recipes;
        newList.splice(recipeIndex, 1);
        this.setState({recipes: newList});
    },
    getFirstRecipes: function() {
    return [{
            name: "Spaghetti Bolognaisse",
            ingredients: [
                "2 chopped onions",
                "3 cloves of garlic",
                "4 tomatoes"
            ],
            description: 'Put it all in a pot and cook for about 20 minutes'
        },{
            name: "Curry",
            ingredients: [
                "2 tbs curry powder",
                "500g chicken",
                "1L chicken stock"
            ],
            description: 'Put it all in a pot and cook for about 20 minutes'
        }
    ] 
}
});

ReactDOM.render(
    <RecipeBox />,
    document.getElementById('content')
);