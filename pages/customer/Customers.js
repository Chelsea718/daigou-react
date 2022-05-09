import {gql, useQuery} from "@apollo/client";
import 'bootstrap/dist/css/bootstrap.min.css';
// import classes from '../customer/Orders.module.css';
import Link from 'next/link';
import {toTimeString} from "../../lib/util";
import {Err, Loading} from "../../components/apolloClient";
import * as React from "react";
import {useEffect, useState} from "react";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Box from "@mui/material/Box";
import {visuallyHidden} from "@mui/utils";
import TableSortLabel from "@mui/material/TableSortLabel";

const headCells = [
	{id: 'action', label: 'Action', minWidth: 170},
	{id: 'name', label: 'Name', minWidth: 170},
	{id: 'updatedDate', label: 'UpdatedDate', minWidth: 170},
	{id: 'parent', label: 'Parent', minWidth: 170},
	{id: 'moneyToParent', label: 'MoneyToParent', minWidth: 170, align: 'left'},
	{id: 'comment', label: 'Comment', minWidth: 170},
	{id: 'address', label: 'Address', minWidth: 170},
	{id: 'isAgent', label: 'isAgent', minWidth: 170},
	{id: 'discount', label: 'Discount', minWidth: 170, align: 'left', format: (value) => value.toFixed(2)}
];

export const GetCustomersQuery = gql`
	query getCustomers($offset: Int, $limit: Int, $orderBy: String, $order: OrderEnum, $keyword: String) {
		getCustomers(offset: $offset, limit: $limit, orderBy: $orderBy, order: $order, keyword: $keyword) {
			qty totalQty offset limit orderBy order
			records {
				id createdDate updatedDate version address comment email enabled
				idNumber name phone nameInitial discount isAgent moneyToParent
				parent {id name} addresses mysqlId mysqlParentId
			}
		}
	}
`;

const Customers = () => {
	const [keyword, setKeyword] = useState('');
	const [order, setOrder] = React.useState('desc');
	const [orderBy, setOrderBy] = React.useState('updatedDate');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	console.log(`keyword=${keyword},order = ${order}, orderBy = ${orderBy}, page = ${page}, rowsPerPage=${rowsPerPage}`);

	const handleRequestSort = (property) => async (event) => {
		console.log('newOrderBy =', property);
		let newOrderBy = property;
		let newOrder = (orderBy === property && order === 'asc') ? 'desc' : 'asc';
		setOrder(newOrder);
		setOrderBy(newOrderBy);
		setPage(0);
	};

	const handleChangePage = async (event, newPage) => {
		console.log('newPage =', newPage);
		setPage(newPage);
		await fetchMore({
			variables: {
				offset: newPage * rowsPerPage
			}
		});
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setPage(0);
			refetch({keyword, offset: 0});
		}, 1000);
		return () => {
			clearTimeout(timeoutId);
		};
	}, [keyword]);

	let offset = page * rowsPerPage, limit = rowsPerPage;
	const {loading, error, data, refetch, fetchMore} = useQuery(GetCustomersQuery, {
		variables: { keyword, offset, limit, orderBy, order}
	});
	if (loading) return <Loading/>;
	if (error) return <Err error={error}/>;
	let customers = data.getCustomers;
	console.log('customers =', customers);

	return <>
		<div className="card bg-primary m-2">
			<div className="row m-2">
				<div className="col-sm-3">
					<h4>Customers</h4>
				</div>
				<div className="col-sm-4">
					<a className="btn btn-info" href='/customer/CreateCustomer'> Create a customer </a>
				</div>
				<div className="col-sm-5 mx-auto">
					<div className="input-group">
						<input autoFocus className="form-control border" type="search" value={keyword} onChange={e => setKeyword(e.target.value)}/>
						<span className="input-group-btn">
                			<label className="btn btn-info">Search</label>
           				</span>
					</div>
				</div>
			</div>
		</div>

		<Box sx={{mx: 2}}>
			<TableContainer sx={{maxHeight: 440, minWidth:650}} component={Paper}>
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow>
							{headCells.map(headCell => (
								<TableCell
									key={headCell.id}
									align={headCell.align}
									padding={true ? 'none' : 'normal'}
									sortDirection={orderBy === headCell.id ? order : false}
									// style={{minWidth: headCell.minWidth}}
								>
									<TableSortLabel
										active={orderBy === headCell.id}
										direction={orderBy === headCell.id ? order : 'asc'}
										onClick={handleRequestSort(headCell.id)}
									>
										{headCell.label}
										{orderBy === headCell.id ? (
											<Box component="span" sx={visuallyHidden}>
												{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
											</Box>
										) : null}
									</TableSortLabel>
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{customers?.records?.map((row) => (
							<TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
								<TableCell><Link href={`/customer/UpdateCustomer?id=${row.id}`}>Edit</Link></TableCell>
								<TableCell align="left">{row.name}</TableCell>
								<TableCell align="left">{toTimeString(row.updatedDate)}</TableCell>
								<TableCell align="left">{row.parent?.name}</TableCell>
								<TableCell align="left">{row.moneyToParent}</TableCell>
								<TableCell align="left">{row.comment}</TableCell>
								<TableCell align="left">{row.address}</TableCell>
								<TableCell align="left">{row.isAgent}</TableCell>
								<TableCell align="left">{row.discount}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[5, 10, 20]}
				component="div"
				count={customers.totalQty}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Box>
	</>
		;
}
export default Customers;