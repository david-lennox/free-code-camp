var api = 'https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=';

var Page = React.createClass({
    render: function(){
        var href = 'https://en.wikipedia.org/wiki/' + this.props.title.replace(' ', '_');
        return <li><a href={href}>{this.props.title}</a>: {this.props.extract}</li>
    }
});

var WikiSearch = React.createClass({
    getInitialState: function(){
        return {
            searchField: '', 
            resultPages: {}
        }
    },
    handleSearchFieldChange: function(e){
        this.setState({searchField: e.target.value});
    },
    searchWikipedia: function(){
        this.setState({searchField: ''});
        var self = this;
        // &callback = ? IS VERY IMPORTANT. This is JSONP call.
        $.getJSON(api + self.state.searchField + '&callback=?',     
            function(results){
                self.setState({resultPages: results.query.pages});
            }
        )
    },
    getRandomArticle: function(){
        window.location.href = "https://en.wikipedia.org/wiki/Special:Random";
    },
    render: function(){
        var self = this;
        var pageElements = Object.keys(self.state.resultPages).map(function(page){
            return (
                <Page title={self.state.resultPages[page].title} 
                    extract={self.state.resultPages[page].extract} 
                    key={self.state.resultPages[page].pageid} />
            ) 
        });
        return (
            <div className="wikiSearch">
            <input  
                type="text" 
                value={this.state.searchField} 
                onChange={this.handleSearchFieldChange} />
            <button onClick={this.searchWikipedia}>Search Wikipedia</button>
            <button onClick={this.getRandomArticle}>Random Article</button>
            <ul>
                {pageElements}
            </ul>
        </div>
        )        
    }
});

ReactDOM.render(
    <WikiSearch />,
    document.getElementById('content')
);