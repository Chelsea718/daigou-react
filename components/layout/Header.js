import classes from "./Header.module.css";
import HeaderCartButton from "./HeaderCartButton";
import styled from "@emotion/styled";
import * as React from "react";
import {useContext} from "react";
import {Context} from "../context";
import Button from "@mui/material/Button";
import {useRouter} from "next/router";
import {MenuItem} from "@mui/material";
import Link from "@mui/material/Link";

const Header = (props) => {
	let context = useContext(Context);
	// console.log('context.isLoggedIn = ', context.isLoggedIn);
	const router = useRouter();

	return (
		<div className="mt-1 mb-1 mx-1 my-1">
			<header className={classes.header}>
				<Link href="/" underline="none"> 悉尼境界澳洲代购 </Link>
				{
					context.isLoggedIn &&
					<>
						<Link href="/order/Orders" underline="none"> Orders </Link>
						<Link href="/customer/Customers" underline="none"> Customers</Link>
						<Link href="/item/Items" underline="none"> Items </Link>
						<Link href="/" underline="none" onClick={async (e) => {
							console.log('logout');
							e.preventDefault();
							context.isLoggedIn = false;
							localStorage.removeItem('isLoggedIn')
							await router.push('/Login/Login');
						}}> Logout
						</Link>
					</>
				}
			</header>

		</div>
	);
};

const RedLink = styled.a`
  color: red;
`;

export default Header;
