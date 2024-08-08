import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";

import { Card, Label, Button, Flex, Fieldset, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


function CustomerEditForm(customer: Schema["Customer"]["type"] | null,
        addCustomer: Function, updateCustomer: Function, 
) {

    const initialCust = {
        customerId: '',
        customerName: '',
        cifNumber: 0,
        legalId: ''
    } as Schema["Customer"]["type"];
    const [cust, setCust] = useState(initialCust);

    useEffect(() => {
        if(customer != null)
            setCust(customer)
    },[]);

    return (
        <Card>
        <Flex direction="column" alignItems="flex-start">
            <Fieldset legend="Metadata" variation="plain" direction="row">
                <Label>Customer ID: {cust.customerId ? cust.customerId : 'to be generated'}</Label>
                <Label>CIF Number: {cust.cifNumber ? cust.cifNumber : 'to be updated'}</Label>
                <Label>Created: {cust.createdAt ?? '-' }</Label>
                <Label>Updated: {cust.updatedAt ?? '-' }</Label>
            </Fieldset>

            <Fieldset legend="Basic information" variation="plain" direction="row">
                
            </Fieldset>
        </Flex>
        </Card>
    );
}

export default CustomerEditForm;