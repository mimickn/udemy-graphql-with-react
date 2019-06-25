import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Query } from 'react-apollo';
import client from './client'
import { SEARCH_REPOSITORIES } from './graphql'
import Autosuggest from "react-autosuggest";

const DEFAULT_STATE = {
  first: 5,
  after: null,
  last: null,
  before: null,
  query: "",
  suggestions: [],
  value: "",
};

const getSuggestionValue = suggestion => suggestion.node.name;
const renderSuggestion = suggestion => <div>{suggestion.node.name}</div>;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE;

    this.handleChange = this.handleChange.bind(this);
    this.suggestions = []
  }

  handleChange(event) {
    console.log(event.target.value)
    this.setState({
      ...DEFAULT_STATE,
      query: event.target.value
    })
  }

  handleSubmit(event) {
    event.preventDefault()
  }

  onSuggestionsFetchRequested = ({ value }) => {
    // this.setState({
    //   suggestions: getSuggestions(value)
    // });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
    // this.suggestions = []
  };

  onChange = (event, { newValue }) => {
    console.log(event.target.value)
    console.log(newValue)
    if ( event.target.value !== undefined ) {
      this.setState({
        value: newValue,
        query: event.target.value
      });
    }
    else {
      this.setState({
        value: newValue,
        query: newValue
      });
    }
  };

  render() {
    const { query, first, last, before, after, suggestions, value } = this.state;
    console.log({query});

    const inputProps = {
      placeholder: "Type a programming language",
      value,
      onChange: this.onChange
    };

    return (
      <ApolloProvider client={client} >

        <Autosuggest
          suggestions={this.state.suggestions}
          // suggestions={this.suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
        <Query
          query={SEARCH_REPOSITORIES}
          variables={{ query, first, last, before, after }}
        >
          {
            ({ loading, error, data }) => {
              if (loading) return 'loading...';
              if (error) return `Error! ${error.message}`
              console.log(data);
              console.log(data.search);

              if ( this.state.suggestions !== data.search.edges ) {
                this.setState({ suggestions: data.search.edges })
              }
              // this.suggestions = data.search.edges

              const search = data.search;
              const repositoryCount = search.repositoryCount;
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';
              const title = `Github Repositories Search Results - ${data.search.repositoryCount} ${repositoryUnit}`
              return (
                <React.Fragment>
                  <h2>{title}</h2>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node
                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank">{node.name}</a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </React.Fragment>
              );
            }
          }
        </Query>
      </ApolloProvider>
    );
  }
}

export default App;
