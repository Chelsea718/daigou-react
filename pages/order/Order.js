import Link from '@mui/material/Link'; // why toTimeString should be written seperately?
import {toTimeString} from "../../lib/util";
import {gql, useMutation, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import {useContext, useEffect, useRef, useState} from "react";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import * as React from "react";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Box from "@mui/material/Box";
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {Err, Loading} from "../../components/apolloClient";
import OrderItem from "./OrderItem";
import CustomerList from "../customer/CustomerList";
import {OrderStatusList} from "../../components/context";

const OrderStatusArray = OrderStatusList.map(e => e.value);

const HeadCells = [
	{id: 'action', label: '操作', minWidth: 170},
	{id: 'image', label: '图片', minWidth: 170},
	{id: 'name', label: '名称', minWidth: 170},
	{id: 'price', label: '价格', minWidth: 170},
	{id: 'quantity', label: '数量', minWidth: 170},
	{id: 'totalQuantity', label: '总价', minWidth: 170},
]

const CreateOrderQuery = gql`
    mutation createOrder($createOrderInput: CreateOrderInput) {
        createOrder(input: $createOrderInput) {
            id customerId recipientCustomerId createdDate updatedDate
            comment price discount paidDate paidPrice parcelSentDate status recipientAddress
        }
    }
`;

const UpdateOrderQuery = gql`
    mutation updateOrder($updateOrderInput: UpdateOrderInput) {
        updateOrder(input: $updateOrderInput) {
            id, createdDate version updatedDate comment price discount  paidDate paidPrice parcelSentDate status recipientAddress  customerId  recipientCustomerId
            customer {address idNumber name}
            recipientCustomer {address idNumber name}
        }
    }
`;

const DeleteOrderQuery = gql`
    mutation deleteOrder($id: ID!) {
        deleteOrder(id: $id) {
            id
        }
    }
`;

const getItemsCount = (orderItems) => {
	let itemsCount = 0;
	orderItems?.map(e => itemsCount += e.quantity);
	return itemsCount;
}

const Order = ({orderInit}) => {

	const [order, setOrder] = useState(orderInit); // to be deleted
	const [orderId, setOrderId] = useState(orderInit?.id);
	const [customer, setCustomer] = useState(orderInit?.customer);
	const [recipientCustomer, setRecipientCustomer] = useState(orderInit?.recipientCustomer);
	const [recipientAddress, setRecipientAddress] = useState(orderInit?.recipientCustomer?.address);
	const [comment, setComment] = useState(orderInit?.comment ? orderInit.comment : '');
	const [status, setStatus] = useState(orderInit?.status);
	const [selectedStatusIndex, setSelectedStatusIndex] = useState(OrderStatusArray.indexOf(orderInit?.status))
	const [price, setPrice] = useState(orderInit?.price);
	const [discount, setDiscount] = useState(orderId ? orderInit?.discount : 1);
	const [paidPrice, setPaidPrice] = useState(orderInit?.paidPrice);
	const [orderItems, setOrderItems] = useState(orderId ? orderInit?.orderItems : []);
	const [itemsCount, setItemsCount] = useState(orderId ? getItemsCount(orderInit?.orderItems) : 0);
	const [showImage, setShowImage] = useState(true);

	const [createOrderMutation] = useMutation(CreateOrderQuery);
	const [deleteOrderMutation] = useMutation(DeleteOrderQuery);
	const [updateOrderMutation] = useMutation(UpdateOrderQuery);
	const [showOrderItem, setShowOrderItem] = useState(false);
	const router = useRouter();

	const refOrderItem = useRef(null);
	const [selectedOrderItem, setSelectedOrderItem] = useState();

	useEffect(() => {
		setRecipientAddress(recipientCustomer?.address);
	}, [recipientCustomer]);

	useEffect(() => {
		let orderPrice = 0;
		orderItems?.map(e => orderPrice += e.totalPrice);
		setPrice(orderPrice);
		setPaidPrice(Math.floor(orderPrice * discount));
		setItemsCount(getItemsCount(orderItems));
	}, [orderItems]);

	console.log('order =', order);
	console.log(`showOrderItem = ${showOrderItem}`);
	console.log(`orderItems=${orderItems}, orderId=${orderId}, customer=${customer}, recipientCustomer = ${recipientCustomer}, recipientAddress = ${recipientAddress},comment = ${comment}, status=${status}, selectedStatusIndex=${selectedStatusIndex},price = ${price}, discount = ${discount},paidPrice = ${paidPrice}, selectedOrderItem=${selectedOrderItem}`);

	const deleteOrder = async (e) => {
		e.preventDefault();  // necessary
		console.log('click delete, order=', order);
		deleteOrderMutation({variables: {id: order.id}})
			.then(({data}) => {
				// request succeeds, promise will resolve
				console.log('succeeded to delete order');
				router.push('/order/Orders');
			})
			.catch(e => {
				// request fails, promise will reject with error
				alert('Failed to delete order.\n' + e); //e?
			});
	}

	const saveOrder = async (e) => {
		e.preventDefault();  // necessary
		if (!orderId) {
			// create order
			let createOrderInput = {
				customerId: customer?.id,
				recipientCustomerId: recipientCustomer?.id,
				orderItems
			}
			console.log('createOrderMutation, order =', createOrderInput);
			createOrderMutation({variables: {createOrderInput: createOrderInput}})
				.then(({data}) => {
					setOrder(data.createOrder);
					setOrderId(data.createOrder.id);
					console.log('Succeeded to create order');
					router.push(`/order/UpdateOrder?id=${data.createOrder.id}`);
					// let s= '/order/UpdateOrder?id=' + data.createOrder.id;
					// router.push(s);
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to create order.\n' + e);
				});
		} else {
			// update order
			let orderInput = {
				id: orderId,
				customerId: customer?.id,
				recipientCustomerId: recipientCustomer?.id,
				status, recipientAddress, comment, price, discount, paidPrice,
				orderItems: orderItems.map(e => {
					let newE = {...e};
					delete newE?.__typename;
					delete newE?.item;
					return newE;
				})
			};
			console.log('updateOrderMutation, orderInput =', orderInput);
			updateOrderMutation({variables: {updateOrderInput: orderInput}})
				.then(({data}) => {
					// request succeeds, promise will resolve
					console.log('Succeeded to update order');
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to update order.\n' + e);
				});
		}
	}

	const cancelOrder = (e) => {
		e.preventDefault();  // necessary
		router.push('/order/Orders');
	}

	const saveOrderAndReturn = async (e) => {
		await saveOrder(e);
		await router.push('/order/Orders');
	}

	let newHeadCells = HeadCells;
	if (!showImage) {
		newHeadCells = HeadCells.filter(e => e.id !== 'image')
	}

	return <>
		<h3>{orderId ? 'Update Order' : 'New Order'}</h3>
		<form className="form-control-sm">
			{orderId &&
			<div className="row">
				<label className="col-sm-2 col-form-label">创建时间</label>
				<div className="col-sm-4">
					<input type="text" value={toTimeString(order?.createdDate)} className="form-control" maxLength="255"
						   readOnly/>
				</div>
				<label className="col-sm-2 col-form-label">更新时间</label>
				<div className="col-sm-4">
					<input type="text" value={toTimeString(order?.updatedDate)} className="form-control" maxLength="255"
						   readOnly/>
				</div>
			</div>
			}

			<div className="row mt-2">
				<div className="col-sm-2 col-form-label">
					<Link href={`/customer/UpdateCustomer?id=${customer?.id}`}> 客户 </Link>
				</div>
				<div className="col-sm-4">
					<CustomerList customerId={customer?.id} setCustomer={setCustomer}/>
				</div>

				<div className="col-sm-2 col-form-label">
					<Link href={`/customer/UpdateCustomer?id=${recipientCustomer?.id}`}> 收件人 </Link>
				</div>
				<div className="col-sm-4">
					<CustomerList customerId={recipientCustomer?.id} setCustomer={setRecipientCustomer}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">收件人电话</label>
				<div className="col-sm-4">
					<input type="text" className="form-control" value={recipientCustomer?.phone} readOnly/>
				</div>


				<label className="col-sm-2 col-form-label"> 收件人地址 </label>
				<div className="col-sm-4">
					<input type="text" className="form-control" value={recipientAddress}
						   onChange={e => setRecipientAddress(e.target.value)}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">备注</label>
				<div className="col-sm-4">
					<input type="text" className="form-control" value={comment}
						   onChange={e => setComment(e.target.value)}/>
				</div>

				<label className="col-sm-2 col-form-label">收件人状态</label>
				<div className="col-sm-4">
					<select className="form-control" value={selectedStatusIndex} onChange={e => {
						let index = parseInt(e.target.value);
						setSelectedStatusIndex(index);
						setStatus(OrderStatusArray[index]);
					}}>
						{
							OrderStatusArray.map((s, index) => (
								<option key={index} value={index}>{s}</option>
							))
						}
					</select>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">订单价格</label>
				<div className="col-sm-4">
					<input type="text" className="form-control" value={price} readOnly/>
				</div>

				<label className="col-sm-2 col-form-label">Discount</label>
				<div className="col-sm-4">
					<input type="number" className="form-control" defaultValue={discount}
						   onChange={e => {
							   let newDiscount = +e.target.value;
							   setDiscount(newDiscount);
							   setPaidPrice(Math.floor(price * newDiscount))
						   }}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">订单实付价</label>
				<div className="col-sm-4">
					<input type="number" className="form-control" value={paidPrice}
						   onChange={e => setPaidPrice(parseInt(e.target.value))}/>
				</div>
			</div>

			<div className="row mt-2">
				{/*<div style={{fontSize: 12}}>*/}
				<label className="col-sm-2 col-form-label">商品列表</label>
				<div className="col-sm-2">
					<input type="checkbox"  checked={showImage} onChange={e => setShowImage(e.target.checked)}/>
					<label className="col-form-label">显示图片</label>
				</div>
				<button type="button" className="col-sm-2 btn btn-sm btn-primary btn-success">下载快递单</button>
				&nbsp; &nbsp;
				<button type="button" className="col-sm-2 btn btn-sm btn-primary" onClick={() => {
					setShowOrderItem(false);
					setSelectedOrderItem(null);
					setShowOrderItem(true);
					refOrderItem.current.scrollIntoView();
				}}> 添加一个商品
				</button>
				<label className="col-sm-2 col-form-label">商品总个数：{itemsCount} </label>
			</div>

			<Box sx={{mx: 2}}>
				<TableContainer sx={{maxHeight: 440}}>
					<Table stickyHeader aria-label="sticky table">
						<TableHead>
							<TableRow>
								{newHeadCells.map((headCell) => (
									<TableCell
										key={headCell.id}
										align={headCell.align}
										padding={true ? 'none' : 'normal'}
									>
										{headCell.label}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{orderItems?.map((row) => (
								<TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
									<TableCell>
										<EditIcon color="primary" aria-label="test" onClick={() => {
											setShowOrderItem(true);
											console.log('row =', row);
											setSelectedOrderItem(row);
											refOrderItem.current.scrollIntoView();
										}}/>

										<HighlightOffIcon color="warning" onClick={()=> {
													let newOrderItems = orderItems.filter(orderItem => orderItem.id != row.id)
													setOrderItems(newOrderItems);
										}}/>
									</TableCell>
									{showImage && <TableCell><img src={row.imgThumb}/></TableCell>}
									<TableCell>{row.name}</TableCell>
									<TableCell>{row.price}</TableCell>
									<TableCell>{row.quantity}</TableCell>
									<TableCell>{row.totalPrice}</TableCell>
								</TableRow>))}
						</TableBody>
					</Table>
				</TableContainer>
			</Box>

			<div className="row mt-2">
				<div className="col-sm-3">
					{orderInit && <button className="btn btn-sm btn-danger" onClick={deleteOrder}>删除订单</button>}
				</div>
				<div className="col-sm-3">
					<button className="btn btn-sm btn-light" onClick={cancelOrder}>取消</button>
				</div>
				<div className="col-sm-3">
					<button className="btn btn-sm btn-primary" onClick={saveOrder}>
						{orderId ? '更新订单' : '创建订单'}
					</button>
				</div>
				<div className="col-sm-3">
					<button className="btn btn-sm btn-primary" onClick={saveOrderAndReturn}>
						{orderId ? '更新订单并返回' : '创建订单并返回'}
					</button>
				</div>
			</div>
		</form>

		<div ref={refOrderItem}>
			{showOrderItem &&
			<OrderItem orderItem={selectedOrderItem} orderItems={orderItems} setOrderItems={setOrderItems}
					   setShowOrderItem={setShowOrderItem}/>
			}
		</div>
	</>;
};

export default Order;