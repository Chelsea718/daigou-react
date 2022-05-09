import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import {Err, Loading} from "../../components/apolloClient";
import Customer from "./Customer";

const getCustomerByIdQuery = gql`
    query getCustomerById($id: ID) {
  		getCustomerById(id: $id) {
            id createdDate updatedDate version address comment email enabled
            idNumber name phone nameInitial discount isAgent moneyToParent
            addresses
            parent {id name} 
        }
    }
`;

const UpdateCustomer = () => {
	const router = useRouter();
	if (!router.isReady) return null;
	const customerId = router.query.id;
	console.log("customerId =", customerId);
	const {loading, error, data} = useQuery(getCustomerByIdQuery, {variables: {id: customerId}});
	if (error) return <Err error={error}/>;
	if (loading) return <Loading/>;

	return <Customer customerInit={data.getCustomerById}/>
};

export default UpdateCustomer;