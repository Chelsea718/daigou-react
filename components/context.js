import React from 'react';

export const OrderStatusList = [
	{value: 'NotPaid_ParcelNotSent', label: 'Unpaid and Unsent'},
	{value: 'NotPaid_ParcelSent', 	 label: 'Unpaid and Sent'},
	{value: 'Paid_ParcelNotSent', 	 label: 'Paid and Unsent'},
	{value: 'Paid_ParcelSent', 		 label: 'Paid and Sent'}
];

export const Context = React.createContext({  // usually an object
	orderStatus: OrderStatusList[0].value,  // initial value for this global variable
	isLoggedIn: false
});