import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";

import { useTheme, Message, Grid, Card, Button, Flex, Fieldset, View, TextField, SelectField, PhoneNumberField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';


export default function CustomerEditForm(props: {
        customer: Schema["Customer"]["type"] | null,
        addCustomer: (cust: Schema["Customer"]["type"]) => void, 
        updateCustomer: (cust: Schema["Customer"]["type"]) => void, }) {

    const { tokens } = useTheme();

    const initialCust = {
        //customerId: '',
        customerName: '',
        cifNumber: 0,
        legalId: '',
        dateOfBirth: '',
        phoneNumber: '',
        sex: 'undisclosed'
    } as Schema["Customer"]["type"];

    const [dialCode, setDialCode] = useState('+84');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [cust, setCust] = useState(initialCust);

    useEffect(() => {
        if(props.customer != null)
            setCust(props.customer)
    },[]);

    /*function parseDateTime(st: string): Date {
        try {
            console.debug("date string", st);
            const d = new Date(parseInt(st.substring(0,4)), parseInt(st.substring(6,8))-1, parseInt(st.substring(9,10)));
            return d;
        }
        catch (e) {
            throw "Error parsing date: "+e;
        }
    }*/

    useEffect(() => {
        if(dateOfBirth)
            setCust({...cust, dateOfBirth: dateOfBirth});
    },[dateOfBirth]);

    useEffect(() => {
        if(dialCode && phoneNumber)
            setCust({...cust, phoneNumber: dialCode+''+phoneNumber});
        else
            setCust({...cust, phoneNumber: null});
    },[dialCode,phoneNumber]);

    function sexEnum(st: string): any {
        if(st)
            return st;   
        return "undisclosed";
    }

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
                
                <Grid templateColumns={{ base: "100%", large: "70% 30%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    <TextField value={cust.customerName} label="Customer Name" onChange={(e) => setCust({ ...cust, customerName: e.target.value })} required={true} />
                    <SelectField label="Sex" value={cust.sex??''} onChange={(e) => setCust({ ...cust, sex: sexEnum(e.target.value) })} required={true} >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="undisclosed">Undisclosed</option>
                    </SelectField>

                </Grid>

                <Grid templateColumns={{ base: "100%", large: "70% 30%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    
                    <TextField value={dateOfBirth} label="Date of birth" type="date" onChange={(e) => setDateOfBirth(e.target.value)} required={true} />

                    <Message id="messageBox">
                        {cust.dateOfBirth ? cust.dateOfBirth : 'NA'}
                    </Message>
                </Grid>

                <Grid templateColumns={{ base: "100%", large: "50% 50%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    <TextField value={cust.legalId??''} label="Legal ID (NID)" onChange={(e) => setCust({ ...cust, legalId: e.target.value })} />
                    <PhoneNumberField inputMode="tel" defaultDialCode="+84" onDialCodeChange={(e) => setDialCode(e.target.value)} 
                        value={phoneNumber??''} label="Phone number" onChange={(e) => setPhoneNumber(e.target.value)} />
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
