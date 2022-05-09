import {gql, useQuery} from "@apollo/client";
import 'bootstrap/dist/css/bootstrap.min.css';
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
import {spacing} from '@mui/system';

const headCells = [
	{id: 'action', label: 'Action', minWidth: 170},
	{id: 'img', label: 'Image', minWidth: 170},
	{id: 'name', label: 'Name', minWidth: 170},
	{id: 'price', label: 'Price', minWidth: 170}
];

const GetItemsQuery = gql`
	query GetItems($offset: Int, $limit: Int, $orderBy: String, $order: OrderEnum, $keyword: String) {
		getItems(offset: $offset, limit: $limit, orderBy: $orderBy, order: $order, keyword: $keyword) {
			keyword qty totalQty offset limit orderBy order
			records {
				id createdDate updatedDate name img imgThumb price
			}
		}
	}
`;

const Items = () => {
	const [keyword, setKeyword] = useState('');
	const [order, setOrder] = useState('desc');
	const [orderBy, setOrderBy] = useState('updatedDate');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	console.log(`keyword=${keyword}, order=${order}, orderBy=${orderBy}, page=${page}, rowsPerPage=${rowsPerPage}`);

	const handleRequestSort = (property) => (event) => {
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

	// https://stackoverflow.com/questions/56800694/what-is-the-expected-return-of-useeffect-used-for
	// https://stackoverflow.com/questions/53071774/reactjs-delay-onchange-while-typing
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
	const {loading, error, data, refetch, fetchMore} = useQuery(GetItemsQuery, {
		variables: {keyword, offset, limit, orderBy, order}
	});
	if (loading) return <Loading/>;
	if (error) return <Err error={error}/>;
	let items = data.getItems;
	console.log('items =', items);

	return <>
		<div className="card bg-primary m-2">
			<div className="row m-2">
				<div className="col-sm-3">
					<h4>Items</h4>
				</div>
				<div className="col-sm-4">
					<a className="btn btn-info" href='/item/CreateItem'>Create an item</a>
				</div>
				<div className="col-sm-5 mx-auto">
					<div className="input-group">
						<input autoFocus className="form-control border" type="search" value={keyword}
							   onChange={e => setKeyword(e.target.value)}/>
						<span className="input-group-btn">
                			<label className="btn btn-info">Search</label>
           				</span>
					</div>
				</div>
			</div>
		</div>

		<Box sx={{mx: 1, width: '100%'}}>
			<Paper sx={{width: '100%', mb: 2}}>
				<TableContainer>
					<Table
						sx={{maxHeight: 440}}
						aria-labelledby="tableTitle"
						size='small'
						// stickyHeader aria-label="sticky table"
					>
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
							{items?.records?.map((row) => (
								<TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
									<TableCell><Link href={`/item/UpdateItem?id=${row.id}`}>Edit</Link></TableCell>
									<TableCell><img src={row.imgThumb}/></TableCell>
									<TableCell>{row.name}</TableCell>
									<TableCell>{row.price}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={items.totalQty}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			</Paper>
		</Box>
	</>;
}

export default Items;
