# React Tutorial

This repo includes the React comment box example from [the React tutorial](http://facebook.github.io/react/docs/tutorial.html).

### Node

```sh
npm install
node server.js
```

And visit <http://localhost:3000/>. Try opening multiple tabs!

## Changing the port

You can change the port number by setting the `$PORT` environment variable before invoking any of the scripts above, e.g.,

```sh
PORT=3001 node server.js
```

# Notes on the Tutorial

## React Basics in my own words

React provides a bunch of objects that let you:

1. Define components using JS and an html-like syntax called jsx,
2. Nest components,
3. Define properties on a component (each component is effectively a Class definition).
4. Specify values for properties when you instantiate a component. 

This is just normal constructor behaviour.

You simply define a bunch of components and then tell React to place them into 
the DOM in a particular order and nested in a particular way and with particular
data instantiating each instance of a component. 

React framework takes care of a bunch of things:

* It creates the DOM elements.
* It creates a virtual DOM, which is what you work with.
* It checks when the VD changes and updates the actual DOM - it does this very
efficiently.

Each component has **properties** that are accessed inside the render function
with `this.prop.proertyName`. The `this.prop.children` property is all the child
elements of the component. 

When a component is instantiated the properties can have values assigned through
the attributes of the JSX element. Eg.

Create a Comment component:

    var Comment = React.createClass({
      render: function() {
        return (
          <div className="comment">
            <h2 className="commentAuthor">
              {this.props.author}
            </h2>
            {this.props.children}
          </div>
        );
      }
    });
    
Then instantiate a comment.

    <Comment author="Pete Hunt">This is one comment</Comment>

Which ultimately generates the html in the browser:

    <div class="comment">
        <h2 class="commentAuthor">
          Pete Hunt
        </h2>
        This is one comment
    </div>

## Passing data through properties

The highest level element (no parent) is created by `ReactDom.render()`.
You can create properties on the newly created element using attribtes as shown
for the CommentBox below. 

    ReactDOM.render(
        <CommentBox data={data} />,
        document.getElementById('content') // put the CommentBox element inside the 'content' element.
        );

Now the CommentBox objects (created by this call to `ReactDOM.render()`) will 
have a `props.data` property.

    var CommentBox = React.createClass({
      render: function() {
        return (
          <div className="commentBox">
            <h1>Comments</h1>
            <CommentList data={this.props.data} />
            <CommentForm />
          </div>
        );
      }
    });
    
Now the CommentList object  has a `props.data` property, and this code iterates
over the data to create a Comment instance for each.

    var CommentList = React.createClass({
      render: function() {
        var commentNodes = this.props.data.map(function(comment) {
          return (
            <Comment author={comment.author} key={comment.id}>
              {comment.text}
            </Comment>
          );
        });
        return (
          <div className="commentList">
            {commentNodes}
          </div>
        );
      }
    });





## The createClass function

Note the `createClass` function takes an object the minimum requirement of 
which is a `render` method. You can add a bunch of other methods...

## How to pass data to a parent component

"We need to pass data from the child component back up to its parent. We do this 
in our parent's render method by passing a new callback (handleCommentSubmit) 
into the child, binding it to the child's onCommentSubmit event. Whenever the 
event is triggered, the callback will be invoked:"

## Where does the logic go?

Data collection logic should go with the component that owns that data... 
according to the React tutorial. 



