import {gql, useQuery} from "@apollo/client";
import 'bootstrap/dist/css/bootstrap.min.css';
import Link from 'next/link';
import {toTimeString} from "../../lib/util";
import {Err, Loading} from "../../components/apolloClient";
import {useRouter} from "next/router";
import {Fragment, useContext, useEffect, useState} from "react";
import {Context, OrderStatusList} from "../../components/context";
import * as React from "react";
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
	{id: 'updatedDate', label: 'Updated', minWidth: 170},
	{id: 'customer', label: '客户', minWidth: 170},
	{id: 'parent', label: '介绍人', minWidth: 170},
	{id: 'recipientCustomer', label: '收件人', minWidth: 170},
	{id: 'comment', label: '备注', minWidth: 170},
	{id: 'price', label: '价格', minWidth: 170},
	{id: 'discount', label: '折扣', minWidth: 170},
	{id: 'paidPrice', label: '实付价', minWidth: 170, align: 'left', format: (value) => value.toFixed(2)}
];

const GetOrdersQuery = gql`
    query GetOrders($status: Status, $offset: Int, $limit: Int, $orderBy: String, $order: OrderEnum, $keyword: String) {
        getOrders(status: $status, offset: $offset, limit: $limit, orderBy: $orderBy, order: $order, keyword: $keyword) {
            keyword totalQty offset limit orderBy order
            records {
                id updatedDate comment price discount paidPrice status customerId recipientCustomerId
                customer {
                    name isAgent discount
                    parent {
                        name
                    }
                }
                recipientCustomer {
                    name
                }
                mysqlRecipientCustomerId
                mysqlCustomerId
                recipientAddress
                parcelSentDate
            }
        }
    }`;

const Orders = () => {
	const [keyword, setKeyword] = useState('');
	const [order, setOrder] = React.useState('desc'); // why use React.?
	const [orderBy, setOrderBy] = React.useState('updatedDate');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	console.log(`keyword=${keyword}, order=${order}, orderBy=${orderBy}, page=${page}, rowsPerPage=${rowsPerPage}`);

	let router = useRouter();
	let context = useContext(Context);
	let [status, setStatus] = useState(context.orderStatus);
	console.log('status = ', status);

	const handleRequestSort = (property) => (event) => {
		console.log('newOrderBy =', property);
		let newOrderBy = property;
		let newOrder = (orderBy === property && order === 'asc') ? 'desc' : 'asc';
		console.log('newOrder =', newOrder);
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
	const {loading, error, data, fetchMore, refetch} = useQuery(GetOrdersQuery, {
		variables: {status, offset, limit, orderBy, order} // why and when here add variables
	});

	if (loading) return <Loading/>;
	if (error) return <Err error={error}/>;
	let res = data.getOrders;
	let orders = data.getOrders.records;
	console.log('res =', res);
	console.log('orders =', orders);

	// calculate total price
	let totalPrice = 0;
	for (let order of orders)
		totalPrice += order.paidPrice;

	return <>
		<div className="card bg-primary m-2">
			<div className="row m-2">
				<div className="col-sm-3">
					<h4>Orders</h4>
				</div>
				<div className="col-sm-4">
					<a className="btn btn-info" href='/order/CreateOrder'>Create an order</a>
				</div>
				<div className="col-sm-5 mx-auto">
					<div className="input-group">
						<input className="form-control border" type="search"
							   onChange={(e) => setKeyword(e.target.value)}/>
						<span className="input-group-btn">
                			<label className="btn btn-info">Search</label>
           				</span>
					</div>
				</div>
			</div>
		</div>

		<div className="form-check">
			Status：
			{
				OrderStatusList.map((e, index) => ( // e is single list of OrderStatusList, index is from where?
					<Fragment key={index}>
						<input type="radio" name='statusGroup' value={e.value} defaultChecked={status === e.value}
							   onClick={input => { // input? 形参？event？
								   let newStatus = input.target.value;
								   setStatus(newStatus);
								   context.orderStatus = newStatus;
								   console.log("context is ", context);
							   }}/><label className="form-check-label"> {e.label} </label> &nbsp; &nbsp;</Fragment>
				))
			}
		</div>

		<Box sx={{mx: 3}}>
			<TableContainer sx={{maxHeight: 440}}>
				<Table stickyHeader aria-label="sticky table">
					<TableHead>
						<TableRow>
							{headCells.map((headCell) => (
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
						{orders.map((order) => (
							<TableRow hover role="checkbox" tabIndex={-1} key={order.id}>
								<TableCell align='left'><Link href={`/order/UpdateOrder?id=${order.id}`}>Edit</Link></TableCell>
								<TableCell align='left'>{toTimeString(order.updatedDate)}</TableCell>
								<TableCell align='left'>{order.customer?.name}</TableCell>
								<TableCell align='left'>{order.parent}</TableCell>
								<TableCell align='left'>{order.recipientCustomer?.name}</TableCell>
								<TableCell align='left'>{order.comment}</TableCell>
								<TableCell align='left'>{order.price}</TableCell>
								<TableCell align='left'>{order.discount}</TableCell>
								<TableCell align='left'>{order.paidPrice}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<TablePagination
				rowsPerPageOptions={[5, 10, 20]}
				component="div"
				count={res.totalQty}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</Box>
		<div>总价：{totalPrice}</div>
	</>
}
export default Orders;
