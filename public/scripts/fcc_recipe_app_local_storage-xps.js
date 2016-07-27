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
            name: this.props.ingredient.name || '',
            qtyAndUnit: this.props.ingredient.qtyAndUnit || '',
         }
    },
    render: function(){
        //debugger;

        return this.props.current === true ? 
            (
                <div className="ingredient">
                    Name: <input type="text" value={this.state.name} onChange={this.nameFieldChaange} />
                    Qty: <input type="text" value={this.state.qtyAndUnit} onChange={this.qtyAndUnitFieldChange}/>
                    <button onClick={this.update}>Update</button>
                </div>
            )    : 
            (
                <p id="this.state.name" onClick={this.makeCurrent}>{this.props.name}: {this.props.qtyAndUnit}</p>
            )
    },
    makeCurrent: function(){
        this.props.setCurrentIngredient(this.props.name);
    },
    nameFieldChaange: function(e){
        this.setState({name: e.target.value});
    },
    qtyAndUnitFieldChange: function(e){
        this.setState({qtyAndUnit: e.target.value});
    },
    update: function(){
        this.props.updateIngredient(this.props.name, {name: this.state.nameField, qtyAndUnit: this.state.qtyAndUnitField});
    }
});

var Recipe = React.createClass({

    getInitialState: function(){
        return {title: this.props.recipe.title, ingredients: this.props.recipe.ingredients, currentIngredient: ''}
    },

    render: function(){

        self = this;

        var ingredientList = Object.keys(self.state.ingredients).map(function(ingredientId){
            //debugger;
           return <Ingredient
                key={ingredientId}
                ingredient={self.state.ingredients[ingredientId]}
                current={self.state.currentIngredient === ingredientId}
                updateIngredient={self.updateIngredient}
                removeIngredient={self.removeIngredient}
                setCurrentIngredient={self.setCurrentIngredient} />
        });
        return self.props.current === true ?
            //debugger;
             (
                <div id={self.state.title} className='recipe'>
                    <input type='text' value={self.state.title} onChange={this.handleTitleChange} />
                    {ingredientList}
                    <button onClick={self.update}>Update</button>
                </div> ) :
            
         (
            <div id={self.state.title} className='recipe'>
                <h3>{self.state.title}</h3>
                <button onClick={self.addIngredient}>Add Ingredient</button>
                {ingredientList}
                <button onClick={self.makeCurrent}>Edit</button>
                <button onClick={self.remove}>Delete</button>
            </div>
        )
    },

    remove: function(){
        this.props.removeRecipe(this.state.title);
    },

    handleTitleChange: function(e){
        this.setState({title: e.target.value});
    },

    makeCurrent: function(){
        this.props.setCurrentRecipe(this.props.recipe.title); // or this.state.title? Is it possible they're different?
    },

    update: function(){
        //debugger;
        this.props.updateRecipe(this.props.recipeId, {title: this.state.title, ingredients: this.state.ingredients});
    },

    addIngredient: function(){
        var newList = this.state.ingredients;
        newList['new'] = {name: '', qtyAndUnit: ''};
        this.setState({ingredients: newList, currentIngredient: 'new'});
    },

    updateIngredient: function(oldName, ingr){  
        var newList = this.state.ingredients;
        delete newList[oldName];
        newList[ingr.name] = ingr;
        this.setState({ingredients: newList, currentIngredient: ''});
    },
    setCurrentIngredient: function(name){
        this.setState({currentIngredient: name})
    },
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
    "Spaghetti Bolognaisse": {
        ingredients: {
            onion: 1,
            carrot: 2,
            garlic: '3 cloves'
        },
        description: 'Put it all in a pot and cook for about 20 minutes'
    }
}
