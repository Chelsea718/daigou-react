import {gql, useQuery} from "@apollo/client";
import {Err, Loading} from "../../components/apolloClient";
import {useState} from "react";
import {GetCustomersQuery} from "./Customers.js";

const CustomerList = ({customerId, setCustomer}) => {

	const [selectedCustomerIndex, setSelectedCustomerIndex] = useState(-1);

	const {loading, error, data} = useQuery(GetCustomersQuery, {variables: {keyword: ''}});
	if (error) return <Err error={error}/>;
	if (loading) return <Loading/>;
	let customers = data.getCustomers?.records;
	if (customerId) {
		customers?.map((c, index) => {
			if (c.id === customerId && selectedCustomerIndex != index)
				setSelectedCustomerIndex(index);
		});
	} else {
		if (selectedCustomerIndex != -1)
			setSelectedCustomerIndex(-1);
	}
	console.log(`customerId = ${customerId}, selectedCustomerIndex = ${selectedCustomerIndex}`);

	return <>
		<select
			className="form-control"
			value={selectedCustomerIndex}
			onChange={e => {
				let index = parseInt(e.target.value);
				setSelectedCustomerIndex(index);
				let selectedCustomer = customers[index];
				console.log('onChange, selectedCustomer=', selectedCustomer);
				setCustomer(selectedCustomer);
			}}
		>
			<option disabled key={-1} value={-1}> -- select a customer --</option>
			{
				customers?.map((c, index) => (
					<option key={index} value={index}>
						{c.nameInitial}{c.name} &nbsp; {c.address?.substr(0, 6)}
					</option>
				))
			}
		</select>
	</>;
};

export default CustomerList;