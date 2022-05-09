import {useRef, useState} from "react";
import {gql, useMutation, useQuery} from "@apollo/client";
import {Err, Loading} from "../../components/apolloClient";
import * as React from "react";

const GetItemsQuery = gql`
    query getItems($offset: Int, $limit: Int, $orderBy: String, $order: OrderEnum) {
        getItems(offset: $offset, limit: $limit, orderBy: $orderBy, order: $order) {
            qty totalQty offset limit orderBy order
            records {
                id createdDate updatedDate name img imgThumb price
            }
        }
    }`

const OrderItem = ({orderItem, orderItems, setOrderItems, setShowOrderItem}) => {
	const [existingItem, setExistingItem] = useState(orderItem?.itemId ? true : false);
	const [orderItemId, setOrderItemId] = useState(orderItem?.id);
	const [name, setName] = useState(orderItem?.name);
	const [price, setPrice] = useState(orderItem?.price);
	const [quantity, setQuantity] = useState(orderItem?.quantity);
	const [image, setImage] = useState(orderItem?.image);
	const [imgThumb, setImgThumb] = useState(orderItem?.imgThumb);
	const [totalPrice, setTotalPrice] = useState(orderItem?.totalPrice);
	const [itemSearchKeyword, setItemSearchKeyword] = useState();
	const [itemId, setItemId] = useState(orderItem?.itemId);

	console.log('orderItem: ', orderItem);
	console.log(`existingItem=${existingItem}, itemSearchKeyword=${itemSearchKeyword}, orderItemId = ${orderItemId}, itemId = ${itemId},  image = ${image},itemName = ${name}, itemPrice = ${price}, itemQuantity = ${quantity}, itemTotalPrice = ${totalPrice}, imgThumb=${imgThumb}`);

	const updateOrderItem = () => {
		let newOrderItem = {
			id: orderItemId,
			name, price, quantity, totalPrice, itemId, imgThumb
		}
		let newOrderItems = orderItems.map(e => {
			let newE = {...e};  // everything inside a react state variable is read-only，orderItems is in the state of order
			console.log('e=', newE);
			if (newE.id === orderItemId) newE = newOrderItem;
			return newE;
		});
		setOrderItems(newOrderItems);
	}

	const createOderItem = () => {
		let newOrderItem = {
			name, price, quantity, totalPrice, itemId, imgThumb
		}
		let newOrderItems = [...orderItems, newOrderItem];
		setOrderItems(newOrderItems);
		return true; // ??
	}

	const saveItemAndAdd = async (e) => {
		e.preventDefault();
		if (orderItemId) updateOrderItem();
		else createOderItem();
		resetItemState();
	}

	const saveItemAndReturn = async (e) => {
		e.preventDefault();
		if (orderItemId) updateOrderItem();
		else createOderItem();
		setShowOrderItem(false);
	}

	const resetItemState = () => {
		setOrderItemId(null);
		setName('');
		setPrice('');
		setQuantity('');
		setTotalPrice('');
	}

	const cancelAddNewItem = (e) => {
		e.preventDefault();
		setShowOrderItem(false);
		setExistingItem(false);
	}

	const {loading, error, data} = useQuery(GetItemsQuery, {
		variables: {offset: 0, limit: 10000, orderBy: "updatedDate", order: "desc"}
	});
	if (loading) return <Loading/>;
	if (error) return <Err error={error}/>;
	let items = data.getItems.records;
	let itemIdArray = items.map(e => e.id);

	return <>
		<h3>Item</h3>
		<form className="form-control-sm">
			<div className="row">
				<div className="col-sm-2">
					<input className="form-check-input" type="checkbox" checked={existingItem}
						   onChange={e => setExistingItem(e.target.checked)}
					/> 已有商品
				</div>
				{existingItem &&
				<>
					<input className="col-sm-8" type="text" value={itemSearchKeyword}
						   onChange={e => setItemSearchKeyword(e.target.value)}/>
					<button className="col-sm-1 btn-primary">搜索</button>
				</>
				}
			</div>

			{existingItem &&
			<>
				<div className="row mt-2">
					<div className="col-sm-2">
						<img src={image}/>
					</div>

					<div className="col-sm-9">
						<select className="form-select"  aria-label="multiple select example" size="5"
								value={itemIdArray.indexOf(itemId)}
								onChange={e => {
									let index = parseInt(e.target.value);
									let selectedItem = items[index];
									setImage(selectedItem.imgThumb);
									setItemId(selectedItem.id);
									console.log('onChange, selectedItem=', selectedItem);
									setImgThumb(selectedItem.imgThumb);
									setName(selectedItem.name);
									setPrice(selectedItem.price);
									setTotalPrice(selectedItem.totalPrice);
								}}
						>
							<option disabled key={-1} value={-1}> -- select an item --</option>
							{
								items.map((item, index) => (
									(!itemSearchKeyword || item?.name?.includes(itemSearchKeyword)) &&
									<option key={index} value={index}>
										{item.name}
									</option>
								))
							}
						</select>
					</div>
				</div>
			</>
			}

			<div className="row mt-2">
				<label className="col-sm-1 col-form-label">名称</label>
				<div className="col-sm-11">
					<input type="text" className="form-control" value={name}
						   onChange={e => setName(e.target.value)}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-1 col-form-label">价格</label>
				<div className="col-sm-3">
					<input type="text" className="form-control" value={price}
						   onChange={e => {
							   let newPrice = +(e.target.value);
							   setPrice(newPrice);
							   setTotalPrice(newPrice * quantity);
						   }}/>
				</div>
				<label className="col-sm-1 col-form-label">数量</label>
				<div className="col-sm-3">
					<input type="text" className="form-control" value={quantity}
						   onChange={e => {
							   let newQuantity = +(e.target.value);
							   setQuantity(newQuantity)
							   setTotalPrice(price * newQuantity);
						   }}/>
				</div>
				<label className="col-sm-1 col-form-label">总价</label>
				<div className="col-sm-3">
					<input type="text" className="form-control" value={totalPrice} onChange={e => setTotalPrice(e.target.value)}/></div>
			</div>

			<div className="row mt-2">
				<div className="col-sm-4">
					<button className="btn btn-sm btn-primary" onClick={cancelAddNewItem}>取消</button>
				</div>
				<div className="col-sm-4">
					<button className="btn btn-sm btn-success" onClick={saveItemAndAdd}>
						{orderItemId ? '更新然后添加' : '添加然后添加'}</button>
				</div>
				<div className="col-sm-4">
					<button className="btn btn-sm btn-primary" onClick={saveItemAndReturn}>
						{orderItemId ? '更新商品' : '添加商品'}</button>
				</div>
			</div>
		</form>
	</>
}

export default OrderItem;