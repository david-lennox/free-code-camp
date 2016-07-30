/**
 * LEARNING POINT
 * Keep most components as 'pure' meaning they have no state and just render the props passed down.
 * Previous version of this file tried to spread the State model across the RecipeBook, Recipe, and 
 * Ingredient classes. This is wrong. It should all be contained in the first because it is not 
 * possible to make a change to Ingredient that is not to be reflected in the RecipeBook. 
 * 
 * This app may be developed in a very similar way to the Kanban-App of the Apress Pro React book.
 * In particular have a look how that app creates the list of tasks in CheckList.js (chapter 4 version).
 * Note that a Task component is passed (as props) functions defined in the RecipeBook which expect a
 * taskId and a CardId. These equate to an ingredientId, and a RecipeId.
 * 
 * Note the method of 'binding' the context and the arguments to functions. So this is a way of passing
 * in the arguments without actually calling the function. The bind function returns a new function that 
 * will be called with the specified arguments.
 * 
 * The code is coupled to the data structure, which is described by example in getInitialRecipes().
 * 
 * Note the React method of accessing a component to set the focus. `ReactDOM.findDOMNode(this.refs.refName).focus()`.
 * Note also we can apply focus to an input with the autoFocus property - used in this file also.
 * 
 * TODO:
 *  - Replace newList method of updating state. Use the react immutable helper addon update() method.
 */

var Ingredient = React.createClass({
    render: function(){
        return (
        <div key={this.props.ingredient}>                            
            <li>
                {this.props.editing ? 
                    <i className="fa fa-trash handCursor" 
                        onClick={this.props.deleteIngredient.bind(null, this.props.index)}>
                    </i> 
                    : null}
                <span className="ingredient">{this.props.ingredient}</span>
            </li>
        </div>)
    }
});

var NewRecipeForm = React.createClass({
    render: function(){
        return (
            <div className="newRecipe">
                    <label>New recipe: </label>
                    <input type="text" 
                        value={this.props.newRecipe} 
                        onChange={this.props.newRecipeFieldChange} 
                        onKeyPress={this.props.checkNewRecipeEnterKey}
                        ref="newRecipeField"
                        className="leftMargin"
                        />
                    <button onClick={this.props.toggleNewRecipeField} className="btn btn-danger leftMargin">Cancel</button>

                </div>
        )
    },
    componentDidMount: function(){
        ReactDOM.findDOMNode(this.refs.newRecipeField).focus(); 
    },
});

var RecipeEditor = React.createClass({
    render: function(){
        return (
            <div className="recipeEditor">
                <h3>{this.props.recipe.name}
                    <span className="rightleftmargin"><button onClick={this.props.stopEditing} className='btn btn-success btn-sm'>Save</button></span>
                    <span><button onClick={this.props.deleteRecipe} className='btn btn-danger btn-sm'>Delete</button></span>
                </h3>
                <h4>Recipe Name</h4> 
                <input 
                    type="text" 
                    value={this.props.recipe.name} 
                    onChange={this.props.currentRecipeNameChange} 
                />
                <h4>Ingredients</h4>
                <ul>{this.props.ingredients}</ul>                
                <input type="text"
                    className="add-ingredient"
                    placeholder="Add ingredient - press Enter to insert..."
                    onKeyPress={this.checkInputKeyPress}
                    autoFocus
                /> 
                <h4>Description</h4> 
                <textarea 
                    className="description"
                    value={this.props.recipe.description} 
                    onChange={this.props.currentDescriptionChange}
                />
                                
            </div>
        )
    },
    checkInputKeyPress: function(evt){
        if(evt.key === 'Enter'){
        this.props.addIngredient(evt.target.value);
        evt.target.value = '';
        }
    }
});

var Recipe = React.createClass({
    render: function(){

        var self = this;        

        return (
            <div style={{clear: "both"}} id={this.props.recipe.name} className='recipe'>
                <h3>
                    <span className="handCursor" onClick={this.props.makeCurrent}>{this.props.recipe.name}</span>
                    <i className={this.props.currentRecipe ? "fa fa-pencil leftMargin handCursor" : ""} onClick={this.props.makeEditable}></i>
                </h3>          
                {this.props.currentRecipe  ? (
                        <div className='recipeDetails'>
                            <ul>{this.props.ingredients}</ul>
                            <p>{this.props.recipe.description}</p>
                        </div>
                ) : null}             
            </div>
        )
    }
});

var RecipeBook = React.createClass({
    getRecipes: function(){
        var firstRecipes = JSON.parse(localStorage.getItem("_dave004_recipes"));
        try {
            var recipesLength = firstRecipes[0].name.length;
        } catch (error) {
            console.log(error);
            console.log("No recipes in the localStorage");
            firstRecipes = this.getFirstRecipes();
        }
        this.setState({recipes: firstRecipes});
    },

    getInitialState: function(){
        return {recipes: {}, newRecipe: '', showNewRecipeForm: false, currentRecipeIndex: -1, editingRecipeIndex: -1}
    },

    componentWillMount: function(){
        this.getRecipes();
    },

    makeCurrent: function(index){
        if(index === this.state.currentRecipeIndex) this.setState({currentRecipeIndex: -1})
        else this.setState({currentRecipeIndex: index, editingRecipeIndex: -1})
    },
    makeEditable: function(index){
        this.setState({editingRecipeIndex: index, currentRecipeIndex: index })
    },
    currentRecipeNameChange: function(evt){
        var newList = this.state.recipes;
        newList[this.state.editingRecipeIndex].name = evt.target.value;
        this.setState({recipes: newList});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },
    currentDescriptionChange: function(evt){
        var newList = this.state.recipes;
        newList[this.state.editingRecipeIndex].description = evt.target.value;
        this.setState({recipes: newList});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },

    render: function(){
        var self = this;
        if(this.state.recipes != null){
            var recipes = this.state.recipes.map(function(recipe, index){

                var editing = self.state.editingRecipeIndex === index;

                if(recipe.ingredients.length > 0) {
                    var ingredients = recipe.ingredients.map(function(ingredient, i){
                    return <Ingredient 
                                key={ingredient} 
                                ingredient={ingredient} 
                                editing={editing} 
                                index={i} 
                                deleteIngredient={self.deleteIngredient} />
                        }
                    );
                }

                else var ingredients = <p className="warning">Please add some ingredients!</p>

                return (
                    <div className="recipes" key={index}>
                        {editing ? (
                            <RecipeEditor
                                recipeIndex={index}
                                recipe={recipe}
                                deleteRecipe={self.deleteRecipe}
                                addIngredient={self.addIngredient}
                                currentRecipeNameChange={self.currentRecipeNameChange} 
                                currentDescriptionChange={self.currentDescriptionChange}
                                ingredients={ingredients}
                                stopEditing={self.stopEditing}
                            />
                            
                        ) : (
                            <Recipe                                
                                recipeIndex={index}
                                recipe={recipe}
                                currentRecipe={self.state.currentRecipeIndex === index}
                                makeEditable={self.makeEditable.bind(null, index)}
                                makeCurrent={self.makeCurrent.bind(null, index)}
                                ingredients={ingredients}
                            />                                            
                        ) }
                        <hr/>
                    </div>
                )
            });
        }
        else var recipes = "No recipes in local storage";

        return (
            <div className="recipeBook">
                { this.state.showNewRecipeForm ? 
                    <NewRecipeForm 
                        newRecipe={this.newRecipe} 
                        newRecipeFieldChange={this.newRecipeFieldChange} 
                        checkNewRecipeEnterKey={this.checkNewRecipeEnterKey}
                        toggleNewRecipeField={this.toggleNewRecipeField}
                    /> : null }                
                <h1>Recipes
                    {this.state.showNewRecipeForm === false ? <i 
                        className='leftMargin handCursor fa fa-plus green'
                        data-toggle="tooltip" 
                        title="New recipe"
                        onClick={this.toggleNewRecipeField} >
                    </i> : null }
                </h1>
                {recipes} 
            </div>
        )
    },
    toggleNewRecipeField: function(){
        this.setState({showNewRecipeForm: !this.state.showNewRecipeForm, currentRecipeIndex: -1, editingRecipeIndex: -1})
    },
    newRecipeFieldChange: function(evt){
        this.setState({newRecipe: evt.target.value});
    },
    checkNewRecipeEnterKey: function(evt){        
        if(evt.key === 'Enter'){
            var newName = this.state.newRecipe;
            var newList = this.state.recipes; 
            newList.unshift({name: newName, ingredients: [], description: ""});
            this.setState({recipes: newList, newRecipe: '', showNewRecipeForm: false, editingRecipeIndex: 0, currentRecipeIndex: 0 });
            localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
        }
    },
    addIngredient: function(ingredient){
        var newList = this.state.recipes;
        //var recipeIndex = newList.findIndex((recipe)=>recipe.name == recipeName);
        newList[this.state.editingRecipeIndex].ingredients.push(ingredient);
        // TODO change this to use the React update libary, rather than replacing the entire list.
        this.setState({recipes: newList});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },
    deleteRecipe: function(){
        var newList = this.state.recipes;
        //var recipeIndex = newList.findIndex((recipe)=>recipe.name == recipeName); // No need to pass down the name if we keep track of the Recipe being edited.
        newList.splice(this.state.editingRecipeIndex, 1);
        this.setState({recipes: newList, editingRecipeIndex: -1, currentRecipeIndex: -1});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },
    deleteIngredient: function(index){
        var newList = this.state.recipes;
        newList[this.state.editingRecipeIndex].ingredients.splice(index, 1);
        this.setState({recipes: newList});
        localStorage.setItem('_dave004_recipes', JSON.stringify(newList));
    },
    stopEditing: function(){
        this.setState({currentRecipeIndex: -1, editingRecipeIndex: -1})
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
    <RecipeBook />,
    document.getElementById('content')
);