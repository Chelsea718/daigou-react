import {gql, useQuery} from "@apollo/client";
import {useRouter} from "next/router";
import {Err, Loading} from "../../components/apolloClient";
import Item from "./Item";

const getItemByIdQuery = gql`
    query getItemById($id: ID) {
  		getItemById(id: $id) {
    		id createdDate updatedDate name img imgThumb price
  		}
	}
`;

const UpdateItem = () => {

	const itemId = useRouter().query.id;
	console.log("itemId =", itemId);
	const {loading, error, data} = useQuery(getItemByIdQuery, {variables: {id: itemId}});
	if (error) return <Err error={error}/>;
	if (loading) return <Loading/>;

	return <Item itemInit={data.getItemById}/>
};

export default UpdateItem;