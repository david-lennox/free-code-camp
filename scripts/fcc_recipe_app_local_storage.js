/**
 * PATTERN EXPLANATION
 * We have a parent that controls the list. The parent creates a new blank item and adds it to
 * the list. Then the child has a `props` property with the original 'new' name. The child is 
 * responsible for keeping track of its new name (changed by the user) and then when the user 
 * clicks 'update' the child sends the parent its new details and its original `props` name so 
 * the parent can replace the old with the new. 
 */

var Ingredient = React.createClass({
    getInitialState: function(){
        return {
            name: this.props.ingredient.name === "new" ? '' : this.props.ingredient.name,
            qty: this.props.ingredient.qty || '',
         }
    },
    render: function(){
        //debugger;

        return this.state.editing === true && this.props.editingRecipe === true ? 
            (
                <div className="ingredient">
                    Name: <input type="text" value={this.state.name} onChange={this.nameFieldChange} />
                    Qty: <input type="text" value={this.state.qty} onChange={this.qtyFieldChange}/>
                    <button onClick={this.update}>Update</button>
                </div>
            )    : 
            (
                <div className="ingredient">
                    <p id="this.state.name" 
                    onClick={this.props.editingRecipe===true ? this.makeEditable : this.warnUneditable}>
                    {this.props.name}: {this.props.qty}</p>
                </div>
            )
    },
    makeEditable: function(){
        this.setState({editing: true});
    },
    warnUneditable: function(){
        alert("Must be editing Recipe to edit the Ingredients!");
    },
    nameFieldChange: function(e){
        this.setState({name: e.target.value});
    },
    qtyFieldChange: function(e){
        this.setState({qty: e.target.value});
    },
    update: function(){
        this.setState({editing: false})
        this.props.updateIngredient(this.props.ingredient.name, {name: this.state.name, qty: this.state.qty});        
    }
});

var Recipe = React.createClass({

    getInitialState: function(){
        var ing = this.props.recipe.ingredients;
        if(!ing['new']) ing['new'] = {title: '', ingredients: {}};
        return {title: this.props.recipe.title, ingredients: ing}
    },

    render: function(){

        self = this;

        var ingredientList = Object.keys(self.state.ingredients).map(function(ingredientId){
            //debugger;
           return <Ingredient
                key={ingredientId}
                ingredient={self.state.ingredients[ingredientId]}
                editingRecipe={self.state.editing}
                updateIngredient={self.updateIngredient} />
        });
        return self.state.editing === true ?
            //debugger;
             (
                <div id={self.state.title} className='recipe'>
                    <label>Recipe Name: </label><input type='text' value={self.state.title} onChange={this.handleTitleChange} />
                    {ingredientList}
                    <button onClick={self.update}>Update</button>
                </div> ) :            
         (
            <div id={self.state.title} className='recipe'>
                <h3>{self.state.title}</h3>
                <button onClick={self.addIngredient}>Add Ingredient</button>
                {ingredientList}
                <button onClick={self.edit}>Edit</button>
                <button onClick={self.delete}>Delete</button>
            </div>
        )
    },
    addIngredient: function(){
        this.ingredients['new'] = {name: 'new', ingredients: {}};
    },

    delete: function(){
        this.props.removeRecipe(this.state.title);
    },

    handleTitleChange: function(e){
        this.setState({title: e.target.value});
    },

    edit: function(){
        this.setState({editing: true}); // or this.state.title? Is it possible they're different?
    },

    update: function(){
        //debugger;
        this.setState({editing: false})
        this.props.updateRecipe(this.props.recipe.title, {title: this.state.title, ingredients: this.state.ingredients});
    },
    updateIngredient: function(oldName, ingredient){
        var newList = this.state.ingredients;
        delete newList[oldName];
        newList[ingredient.name] = ingredient;        
        this.setState({ingredients: newList});
    }
});

var RecipeBox = React.createClass({
    getRecipes: function(){
        // TODO - confirm received data is in the correct format.
        this.setState({recipes: JSON.parse(localStorage.getItem("_dave004_recipes"))});
    },

    getInitialState: function(){
        return {recipes: {}, currentRecipe: ''}
    },

    componentWillMount: function(){
        this.getRecipes();
    },

    setCurrentRecipe: function(title){
        this.setState({currentRecipe: title});
    },

    removeRecipe: function(recipeId){
        var newRecipeList = this.state.recipes;
        delete newRecipeList[recipeId];
        this.setState({recipes: newRecipeList});
        localStorage.setItem('_dave004_recipes', newRecipeList);
    },

    addRecipe: function(){
        var newList = this.state.recipes || {};
        newList['new'] = {title: '', ingredients: {}};
        this.setState({recipes: newList, currentRecipe: 'new'});
    },

    updateRecipe: function(oldTitle, recipe){
        var newList = this.state.recipes;
        delete newList[oldTitle];
        //debugger;
        newList[recipe.title] = recipe;        
        this.setState({recipes: newList});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },

    render: function(){
        var self = this;

        if(self.state.recipes != null){
            //debugger;
            var recipeElements = Object.keys(self.state.recipes).map(function(recipeId){
                return (
                    <Recipe
                    current={recipeId === self.state.currentRecipe}
                    recipeId={recipeId}
                    recipe={self.state.recipes[recipeId]}
                    key={recipeId}
                    removeRecipe={self.removeRecipe}
                    setCurrentRecipe={self.setCurrentRecipe}
                    updateRecipe={self.updateRecipe}/>
                )
            });
        }
        else var recipeEls = "No recipes in local storage";

        return (
            <div className="recipeBox">
            <h1>The Recipe Box</h1>
            <button onClick={this.addRecipe}>Add New</button>
            <h2>Recipes</h2>
            {recipeElements}
            </div>
        )
    }
});

ReactDOM.render(
    <RecipeBox />,
    document.getElementById('content')
);


var recipeStructure = {
    'spag-bol': {
        onion: 1,
        carrot: 2,
        garlic: '3 cloves',
        description: 'Put it all in a pot and cook for about 20 minutes'
    }
}
