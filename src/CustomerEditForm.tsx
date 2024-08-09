import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";

import { Grid, Card, Button, Flex, Fieldset, View, TextField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


export default function CustomerEditForm(props: {
        customer: Schema["Customer"]["type"] | null,
        addCustomer: (cust: Schema["Customer"]["type"]) => void, 
        updateCustomer: (cust: Schema["Customer"]["type"]) => void, }) {

    const initialCust = {
        customerId: '',
        customerName: '',
        cifNumber: 0,
        legalId: ''
    } as Schema["Customer"]["type"];
    const [cust, setCust] = useState(initialCust);

    useEffect(() => {
        if(props.customer != null)
            setCust(props.customer)
    },[]);

    return (
        <Card>
        <Flex direction="column" alignItems="flex-start">
            <Fieldset legend="Metadata" variation="plain" direction="column" width="100%">
                <Grid templateColumns={{ base: "100%", large: "50% 50%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%">
                    <View><em>Customer ID:</em> {cust.customerId ? cust.customerId : 'to be generated'}</View>
                    <View><em>Created:</em> {cust.createdAt ?? '-' }</View>
                    <View><em>CIF Number:</em> {cust.cifNumber ? cust.cifNumber : 'to be updated'}</View>
                    <View><em>Updated:</em> {cust.updatedAt ?? '-' }</View>
                </Grid>
            </Fieldset>

            <Fieldset legend="Basic information" variation="plain" direction="column" width="100%">
                <Grid templateColumns={{ base: "100%", large: "50% 50%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%">
                    <TextField value={cust.customerName} label="Customer Name" onChange={(e) => setCust({ ...cust, customerName: e.target.value })} />
                </Grid>
            </Fieldset>

            <View>
                { !cust.customerId ? <Button onClick={() => props.addCustomer(cust)}>Add Customer</Button> : null }
                { cust.customerId ? <Button onClick={() => props.updateCustomer(cust)}>Save</Button> : null }
            </View>
        </Flex>
        </Card>
    );
}
