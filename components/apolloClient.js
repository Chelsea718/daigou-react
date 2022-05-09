import React from 'react';
import styled from '@emotion/styled';
import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
	uri: "http://localhost:8098/graphql"
});

const errorLink = onError((error) => {
	console.log(error);
	if (error.graphQLErrors)
		// graphQLErrors.forEach(({extensions, message, locations, path }) =>
		error.graphQLErrors.forEach((e) =>
			// console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,),
			console.log('[GraphQL error]:', e)
		);

	if (error.networkError) console.log(`[Network error]: ${error.networkError}`);
});

export const error2string = ({graphQLErrors, networkError}) => {
	let errorStr = '';
	if (graphQLErrors) graphQLErrors.forEach(({extensions, message, locations, path}) =>
		errorStr += `[${extensions.code}]: ${extensions.exception.stacktrace}\n`
	);
	if (networkError) errorStr += networkError;
	return errorStr;
}

// If you provide a link chain to ApolloClient, you don't provide the `uri` option.
export const apolloClient = new ApolloClient({
	// The `from` function combines an array of individual links into a link chain
	link: from([errorLink, httpLink]),
	cache: new InMemoryCache()
});

/**
 * Query Results conditionally renders Apollo useQuery hooks states:
 * loading, error or its children when data is ready
 */
// const QueryResult = ({loading, error, data, children}) => {
// 	if (loading) {
// 		return (
// 			<SpinnerContainer>
// 				<LoadingSpinner data-testid="spinner" size="large" theme="grayscale"/>
// 			</SpinnerContainer>
// 		);
// 	}
// 	if (error) {
// 		return <p>ERROR: {error.message}</p>;
// 	}
// 	if (!data) {
// 		return <p>Nothing to show...</p>;
// 	} else {
// 		return children;
// 	}
// };

export const Loading = () => {
	return (
		<SpinnerContainer>
			{/*<LoadingSpinner data-testid="spinner" size="large" theme="grayscale"/>*/}
			<h3>Loading ...</h3>
		</SpinnerContainer>
	);
}

export const Err = (error) => {
	console.log('error: ', error);
	return <div>ERROR: {error.error.message}</div>;  // not working, why?
}

/** Query Result styled components */
const SpinnerContainer = styled.div({
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	width: '100%',
	height: '100vh',
});
