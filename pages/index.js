import {Fragment, useContext, useState} from "react";
import Head from 'next/head';
import {useRouter} from "next/router";
import Orders from "./order/Orders";
import Login from "./Login/Login";
import {Context} from "../components/context";
import Link from "next/link";
import * as React from "react";

const Home = () => {
	let context = useContext(Context);
	console.log('context =', context);
	return <>
		{context.isLoggedIn ? <Orders/> : <Login/>}
	</>
}
export default Home;
