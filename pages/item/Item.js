import {gql, useQuery, useMutation} from "@apollo/client";
import Link from 'next/link';
import {useRouter} from "next/router";
import {useState} from "react";

const itemsQuery = gql`
    query getItems {
        getItems {id createdDate updatedDate name img price}
    }
`;

const CreateItemQuery = gql`
    mutation createItem($input: CreateItemInput) {
        createItem(input: $input) {
        	id createdDate updatedDate name img price
        }
    }
`;

const UpdateItemQuery = gql`
    mutation updateItem($input: UpdateItemInput) {
        updateItem(input: $input) {
             id createdDate updatedDate name img price
    	}
    }
`;

const DeleteItemQuery = gql`
	mutation deleteItem($deleteItemId: ID!) {
	  deleteItem(id: $deleteItemId) {
		id
	  }
	}
`;

const Item = ({itemInit}) => {

	const [createItemMutation] = useMutation(CreateItemQuery);
	const [deleteItemMutation] = useMutation(DeleteItemQuery);
	const [updateItemMutation] = useMutation(UpdateItemQuery);
	const router = useRouter();

	const [ itemId, setItemId] = useState(itemInit?.id);
	const [name, setName] = useState(itemInit?.name);
	const [img, setImg] = useState(itemInit?.img);
	const [imgThumb, setImgThumb] = useState(itemInit?.imgThumb);
	const [price, setPrice] = useState(itemInit?.price);

	console.log('itemInit =', itemInit);
	console.log(`itemId=${itemId}, name=${name}, price=${price}`);

	const deleteItem = async (e) => {
		e.preventDefault();  // necessary
		console.log('click delete, itemId=', itemId);
		deleteItemMutation({variables: {deleteItemId: itemId}})
			.then(({data}) => {
				// request succeeds, promise will resolve
				console.log('succeeded to delete item')
				router.push('/item/Items');
			})
			.catch(e => {
				// request fails, promise will reject with error
				alert('Failed to delete item.\n' + e);
			});
	}

	const saveItem = async (e) => {
		e.preventDefault(); // necessary
		/*console.log('saveItem, item=', name);*/
		if (!itemInit) {
			/*console.log('createItemMutation');*/
			let createItemInput = { name,price };
			createItemMutation({variables: {input: createItemInput}})
				.then(({data}) => {
					// request succeeds, promise will resolve
					alert('Succeeded to create item');
					router.push('/item/UpdateItem?id=' + data.createItem.id);
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to create item.\n' + e);
				});
		} else {
			let itemInput = {
				id: itemId,
				name: name,
				price: price,
			};
			console.log('updateItemMutation, itemInput =', itemInput);
			updateItemMutation({variables: {input: itemInput}})
				.then(({data}) => {
					// request succeeds, promise will resolve
					alert('Succeeded to update order');
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to update item .\n' + e);
				});
		}
	}

	const cancelItem = (e) => {
		e.preventDefault();
		router.push('/item/Items');
	}

	const saveItemAndReturn = async (e) => {
		await saveItem(e);
		router.push('/item/Items');
	}

	return <>
		<div className="card bg-info mt-4 mb-3 mx-3 my-4">
			<div className="card-title">
				<label>{itemId ? 'Update Item' : 'Create Item'}</label>
			</div>

			<form className="form-control form-control-lg">
				<div className="form-group row">
					<label className="col-sm-2 col-form-label">Image</label>
					<div className="col-sm-10">
						<img src={img}/>
					</div>
				</div>

				<div className="form-group row form-control-lg">
					<label className="col-sm-2 col-form-label">Name</label>
					<div className="col-sm-10">
						<input type="text" className="form-control" value={name}
							   onChange={e => setName(e.target.value)}/>
					</div>
				</div>

				<div className="form-group row form-control-lg">
					<label className="col-sm-2 col-form-label">Price</label>
					<div className="col-sm-10">
						<input type="number" className="form-control" value={price}
							   onChange={e => setPrice(+(e.target.value))}/>
					</div>
				</div>

				<div className="form-group row form-control-lg">
					<div className="col-sm-3">
						<button className="btn btn-sm btn-light" onClick={cancelItem}>Cancel</button>
					</div>
					<div className="col-sm-3">
						 <button className="btn btn-sm btn-primary" onClick={saveItem}>{itemId ? 'Update' : 'Save'}</button>
					</div>
					<div className="col-sm-3">
						{itemInit && <button className="btn btn-sm btn-danger" onClick={deleteItem}>Delete</button>}
					</div>
					<div className="col-sm-3">
						 <button className="btn btn-sm btn-danger" onClick={saveItemAndReturn}>Save and Return</button>
					</div>
				</div>


			</form>
		</div>
	</>
};

export default Item;
