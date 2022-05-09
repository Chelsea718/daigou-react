import {toTimeString} from "../../lib/util";
import {gql, useMutation} from "@apollo/client";
import {useRouter} from "next/router";
import {useState} from "react";
import {error2string} from "../../components/apolloClient";
import CustomerList from "./CustomerList";

const CreateCustomerQuery = gql`
    mutation createCustomer($createCustomerInput: CreateCustomerInput) {
        createCustomer(input: $createCustomerInput) {
            id address comment email enabled
            idNumber name phone nameInitial discount isAgent moneyToParent
            addresses parentId
            parent {id name}
        }
    }
`;

const UpdateCustomerQuery = gql`
    mutation updateCustomer($updateCustomerInput: UpdateCustomerInput) {
        updateCustomer(input: $updateCustomerInput) {
            id createdDate updatedDate version address comment email enabled
            idNumber name phone nameInitial discount isAgent moneyToParent
            addresses parentId
            parent {id name}
        }
    }
`;

const DeleteCustomerQuery = gql`
    mutation deleteCustomer($id: ID!) {
        deleteCustomer(id: $id) {
            id
        }
    }
`;

const Customer = ({customerInit}) => {

	const [createCustomerMutation] = useMutation(CreateCustomerQuery);
	const [deleteCustomerMutation] = useMutation(DeleteCustomerQuery);
	const [updateCustomerMutation] = useMutation(UpdateCustomerQuery);
	const router = useRouter();

	const [customer, setCustomer] = useState(customerInit);
	const [customerId, setCustomerId] = useState(customerInit?.id);
	const [name, setName] = useState(customerInit?.name);
	const [nameInitial, setNameInitial] = useState(customerInit?.nameInitial);
	const [parentCustomer, setParentCustomer] = useState(customerInit?.parent); // for parentId
	const [moneyToParent, setMoneyToParent] = useState(customerInit?.moneyToParent);
	const [phone, setPhone] = useState(customerInit?.phone);
	const [comment, setComment] = useState(customerInit?.comment);
	const [idNumber, setIdNumber] = useState(customerInit?.idNumber);
	const [email, setEmail] = useState(customerInit?.email);
	const [isAgent, setIsAgent] = useState(customerInit?.isAgent);
	const [discount, setDiscount] = useState(customerInit?.discount);
	const [address, setAddress] = useState(customerInit?.address);
	const [addresses, setAddresses] = useState(customerInit?.addresses);


	const [selectedAddress, setSelectedAddress] = useState(customerInit?.address);
	const [newAddress, setNewAddress] = useState('');

	let addressArray = addresses ? addresses.split(";") : [];

	console.log(`customerId=${customerId}, customer=${customer}, parentId=${parentCustomer?.id}, 
		parentName=${parentCustomer?.name}, comment=${comment}, name=${name}, nameInitial=${nameInitial},
		moneyToParent=${moneyToParent}, phone=${phone}, comment=${comment}, idNumber=${idNumber}, email=${email}, isAgent=${isAgent}, discount=${discount}, address=${address}, addresses=${addresses}`);
	console.log(`newAddress=${newAddress}, selectedAddress=${selectedAddress}, addressArray=${addressArray}`);
	console.log('parentCustomer?.id =', parentCustomer?.id);

	const deleteCustomer = async (e) => {
		e.preventDefault();  // necessary
		console.log('click delete, customer=', customer);
		deleteCustomerMutation({variables: {id: customerId}})
			.then(({data}) => {
				// request succeeds, promise will resolve
				console.log('succeeded to delete customer')
				router.push('/customer/Customers');
			})
			.catch(e => {
				// request fails, promise will reject with error
				alert('Failed to delete customer.\n' + error2string(e));
			});
	}

	const saveCustomer = async (e) => {
		e.preventDefault();  // necessary
		if (!customerId) {
			//create customer
			let createCustomerInput = {
				name,
				nameInitial,
				moneyToParent,
				phone,
				comment,
				idNumber,
				email,
				isAgent,
				discount,
				address,
				addresses,
				parentId: parentCustomer.id
			};
			console.log('createCustomerMutation, createCustomerInput =', createCustomerInput);
			createCustomerMutation({variables: {createCustomerInput: createCustomerInput}})
				.then(({data}) => {
					// request succeeds, promise will resolve
					console.log('Succeeded to create customer');
					router.push('/customer/UpdateCustomer?id=' + data.createCustomer.id);
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to create customer.\n' + error2string(e));
				});
		} else {
			// update customer
			let updateCustomerInput = {
				id: customerId,
				name: name,
				nameInitial: nameInitial,
				parentId: parentCustomer?.id,
				moneyToParent: moneyToParent,
				phone: phone,
				comment: comment,
				isAgent: isAgent,
				email: email,
				addresses: addresses,
				address: address,
				idNumber: idNumber,
				discount: discount
			};
			console.log('updateCustomerMutation, customerInput =', updateCustomerInput);
			updateCustomerMutation({variables: {updateCustomerInput: updateCustomerInput}})
				.then(({data}) => {
					// request succeeds, promise will resolve
					console.log('Succeeded to update customer');
				})
				.catch(e => {
					// request fails, promise will reject with error
					alert('Failed to update customer:\n' + error2string(e));
				});
		}
	}

	const cancelCustomer = async (e) => {
		e.preventDefault();  // necessary
		await router.push('/customer/Customers');
	}

	const saveCustomerAndReturn = async (e) => {
		await saveCustomer(e);
		await router.push('/customer/Customers');
	}

	// const setParentCustomer = (selectedCustomer) => {
	// 	if (selectedCustomer.id !== customer?.parent?.id) {
	// 		let newParent = {...customer.parent, name: selectedCustomer.name, id: selectedCustomer.id};
	// 		console.log('newParent =', newParent);
	// 		setCustomer({...customer, parent: newParent});
	// 	}
	// };

	return <>
		<form className="form-control- mx-3">
			<h2 className="mb-3">{customerId ? 'Update customer' : 'Create customer'}</h2>
			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">Name</label>
				<div className="col-sm-4">
					<input type="text" value={name} className="form-control"
						   onChange={e => setName(e.target.value)}/>
				</div>
				<label className="col-sm-2 col-form-label">Name Initial</label>
				<div className="col-sm-4">
					<input type="text" value={nameInitial} className="form-control"
						   onChange={e => setNameInitial(e.target.value)}/>
				</div>
			</div>

			{customerId &&
			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">创建时间</label>
				<div className="col-sm-4">
					<input type="text" value={toTimeString(customer?.createdDate)} className="form-control"
						   readOnly/>
				</div>
				<label className="col-sm-2 col-form-label">更新时间</label>
				<div className="col-sm-4">
					<input type="text" value={toTimeString(customer?.updatedDate)} className="form-control"
						   readOnly/>
				</div>
			</div>
			}

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">介绍人</label>
				<div className="col-sm-4 mt-2">
					<CustomerList customerId={parentCustomer?.id} setCustomer={setParentCustomer}/>
				</div>
				<label className="col-sm-2 col-form-label">给介绍人红包</label>
				<div className="col-sm-4">
					<input type="number" value={moneyToParent} className="form-control"
						   onChange={e => setMoneyToParent(+(e.target.value))}/>
				</div>
			</div>


			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">Phone</label>
				<div className="col-sm-4">
					<input type="number" value={phone} className="form-control"
						   onChange={e => setPhone(e.target.value)}/>
				</div>
				<label className="col-sm-2 col-form-label">备注</label>
				<div className="col-sm-4">
					<input type="text" value={comment} className="form-control"
						   onChange={e => setComment(e.target.value)}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">ID Number</label>
				<div className="col-sm-4">
					<input type="text" value={idNumber} className="form-control"
						   onChange={e => setIdNumber(e.target.value)}/>
				</div>
				<label className="col-sm-2 col-form-label">Email</label>
				<div className="col-sm-4">
					<input type="text" value={email} className="form-control"
						   onChange={e => setEmail(e.target.value)}/>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">代理</label>
				<div className="col-sm-4">
					<input type="checkbox" checked={isAgent} className="form-control form-check-input"
						   onChange={e => setIsAgent(e.target.checked)}
					/>

				</div>
				<label className="col-sm-2 col-form-label">折扣</label>
				<div className="col-sm-4">
					<input type="number" value={discount} className="form-control"
						   onChange={e => setDiscount(+(e.target.value))}/>
				</div>
			</div>

			<div className="row mt-2">
				<div className="col-sm-2 col-form-label">
					<label>地址列表</label>
				</div>
				{
					addressArray?.map((add, index) => (
						<div className="col-sm" key={index}>
							<input
								type="radio"
								name="addressGroup"
								value={add}
								checked={selectedAddress === add}
								onChange={e => {
									setSelectedAddress(e.target.value);
									setAddress(e.target.value);
								}}
							/>
							{add}
						</div>
					))
				}
			</div>

			<div className="row mt-2">
				<div className="col-sm-2 col-form-label">
					<label>当前地址</label>
				</div>
				<div className="col-sm-6">
					<input type="text" className="form-control" value={address}
						   onChange={e => {
							   setAddress(e.target.value);
						   }}
					/>
				</div>
				<div className="col-sm-2">
					<button
						className="btn btn-sm btn-info"
						disabled={address?.length === 0 || selectedAddress === address}
						onClick={(e) => {
							e.preventDefault();
							let newAddresses = addresses;
							if (newAddresses) newAddresses = newAddresses.replace(selectedAddress, address);
							else newAddresses = address;
							console.log('selectedAddress =', selectedAddress);
							setAddress(address);
							setAddresses(newAddresses);
							setSelectedAddress(address);
						}}
					>
						更新地址列表
					</button>
				</div>
				<div className="col-sm-2">
					<button
						className="btn btn-sm btn-danger"
						disabled={selectedAddress !== address}
						onClick={(e) => {
							e.preventDefault();
							let newAddressArray = addressArray?.filter(address => address !== selectedAddress);
							console.log('newAddressArray=', newAddressArray);
							let newAddresses = newAddressArray?.join(';');
							console.log('newAddresses =', newAddresses);
							setAddress(newAddressArray[0]);
							setAddresses(newAddresses);
							setSelectedAddress(newAddressArray[0]);
						}}> 删除地址
					</button>
				</div>
			</div>

			<div className="row mt-2">
				<label className="col-sm-2 col-form-label">
					添加新地址
				</label>
				<div className="col-sm-7">
					<input type="text" className="form-control" value={newAddress} onChange={e => setNewAddress(e.target.value)}/>
				</div>
				<div className="col-sm-3">
					<button className="btn btn-sm btn-primary"
							disabled={newAddress.length === 0}
							onClick={(e) => {
								e.preventDefault();
								addressArray?.push(newAddress);
								console.log('after add, addressArray =', addressArray);
								let newAddresses = addressArray?.join(';');
								setAddresses(newAddresses);
								setNewAddress('');
							}}
					>添加到地址列表
					</button>
				</div>
			</div>

			<div className="row mt-5">
				<div className="col-sm-3">
					<button className="btn btn-sm btn-danger" onClick={deleteCustomer}>Delete</button>
				</div>

				<div className="col-sm-3">
					<button className="btn btn-sm btn-secondary" onClick={cancelCustomer}>Cancel</button>
				</div>

				<div className="col-sm-3">
					<button className="btn btn-sm btn-primary" onClick={saveCustomer}>Save</button>
				</div>

				<div className="col-sm-3">
					<button className="btn btn-sm btn-primary" onClick={saveCustomerAndReturn}>Save and Return</button>
				</div>
			</div>

		</form>
	</>
}

export default Customer;