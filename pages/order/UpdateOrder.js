import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import {Err, Loading} from "../../components/apolloClient";
import Order from "./Order";

const getOrderByIdQuery = gql`
    query getOrderById($id: ID) {
        getOrderById(id: $id) {
            id, createdDate version updatedDate comment price discount  paidDate paidPrice parcelSentDate status recipientAddress mysqlCustomerId mysqlRecipientCustomerId customerId  recipientCustomerId
            customer {id address idNumber name phone}
            recipientCustomer {id address idNumber name phone}
            orderItems { 
				id totalPrice quantity name price itemId 
				item {id }
                imgThumb
			}
        }
    }
`;

const UpdateOrder = () => {

	const orderId = useRouter().query.id;
	console.log("orderId =", orderId);
	const {loading, error, data} = useQuery(getOrderByIdQuery, {variables: {id: orderId}});
	if (error) return <Err error={error}/>;
	if (loading) return <Loading/>;

	let orderToUpdate = data.getOrderById;
	return <Order orderInit={orderToUpdate}/>
};

export default UpdateOrder;