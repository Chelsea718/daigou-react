import 'bootstrap/dist/css/bootstrap.css';
import '../styles/globals.css'
import {ApolloProvider} from "@apollo/client";
import Layout from "../components/layout/Layout";
import { useContext, useEffect, useState } from "react";
import Head from "next/head";
import {Context} from '../components/context';
import {apolloClient} from "../components/apolloClient";
import Login from "./Login/Login";

function MyApp({Component, pageProps}) {
	const context = useContext(Context);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		import("bootstrap/dist/js/bootstrap");

		context.isLoggedIn = localStorage.getItem('isLoggedIn') ? true : false;
		setIsLoggedIn(context.isLoggedIn);
		// console.log('useEffect, isLoggedIn=', context.isLoggedIn);
		// console.log('Component =', Component);
		if (!context.isLoggedIn) {
			console.log('not logged in yet, redirect to Login page');
			Component = Login;
			console.log('Component =', Component);
		}
	}, []);


	return <>
		<ApolloProvider client={apolloClient}>

			<Head>
				<title>境界代购</title>
				// Responsive meta tag
				<meta name="viewport" content="width=device-width, initial-scale=1"/>
			</Head>
			<Layout>
				<Component {...pageProps} />
			</Layout>

		</ApolloProvider>
	</>
}

export default MyApp;
