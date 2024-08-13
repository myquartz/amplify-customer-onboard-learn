import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";

import { useTheme, Message, Grid, Card, Button, Flex, Fieldset, View, TextField, SelectField, PhoneNumberField } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import moment from 'moment';

export default function CustomerEditForm(props: {
        customer: Schema["Customer"]["type"] | null,
        cancelEdit: () => void,
        addCustomer: (cust: Schema["Customer"]["type"]) => void, 
        updateCustomer: (cust: Schema["Customer"]["type"]) => void, }) {

    const { tokens } = useTheme();

    const [invalidField, setInvalidField] = useState('');
    const [warningMessage, setWarningMessage] = useState('');

    const [dialCode, setDialCode] = useState('+84');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [legalId, setLegalId] = useState('');
    const [gender, setGender] = useState('undisclosed');

    useEffect(() => {
        if(props.customer != null) {
            console.debug("you edit",props.customer);
            setCustomerName(props.customer.customerName);
            setDateOfBirth(props.customer.dateOfBirth);
            setLegalId(props.customer.legalId??'');
            setGender(props.customer.gender??'undisclosed');
            //setDateOfBirth(props.customer.dateOfBirth);
            if(props.customer.phoneNumber) {
                setPhoneNumber(props.customer.phoneNumber.substring(dialCode.length));
            }
        }
        else {
            setCustomerName('');
            setDateOfBirth('');
            setLegalId('');
            setGender('undisclosed');
            setPhoneNumber('');
        }
    },[props.customer]);

    function toCustObj(): Schema["Customer"]["type"] {
        const cust = {
            phoneNumber: dialCode+''+phoneNumber,
            customerName,
            dateOfBirth,
            legalId,
            gender: genderEnum(gender),
        } as Schema["Customer"]["type"];

        if(props.customer != null) {
            cust.customerId = props.customer.customerId;
            cust.cifNumber = props.customer.cifNumber;
        }
            
        return cust;
    }

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

    function genderEnum(st: string): any {
        if(st)
            return st;   
        return "undisclosed";
    }

    useEffect(() => {
        if(invalidField == "phoneNumber") {
            setInvalidField('');
            setWarningMessage('');
        }
    },[phoneNumber]);

    function clickSubmitForm(event: any) {
        event.preventDefault();
        console.debug('phone',phoneNumber);
        if(phoneNumber && phoneNumber.length < 10) {
            setInvalidField('phoneNumber');
            setWarningMessage('Phone number error');
            return;
        }
        if(props?.customer?.customerId)
            props.updateCustomer(toCustObj());
        else
            props.addCustomer(toCustObj());
    }

    return (
    <Card>
        <form onSubmit={clickSubmitForm} method="post">
        <Flex direction="column" alignItems="flex-start">
            <Fieldset legend="Metadata" variation="plain" direction="column" width="100%">
                <Grid templateColumns={{ base: "100%", large: "60% 40%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%">
                    <View><em>Customer ID:</em> {props?.customer?.customerId ? props?.customer?.customerId : 'to be generated'}</View>
                    <View><em>Created:</em> {props?.customer?.createdAt ? moment(props?.customer?.createdAt).fromNow() : '-' }</View>
                    <View><em>CIF Number:</em> {props?.customer?.cifNumber ? props?.customer?.cifNumber : 'to be updated'}</View>
                    <View><em>Updated:</em> {props?.customer?.updatedAt ? moment(props?.customer?.updatedAt).fromNow() : '-' }</View>
                </Grid>
            </Fieldset>

            <Fieldset legend="Basic information" variation="plain" direction="column" width="100%">
                
                <Grid templateColumns={{ base: "100%", large: "70% 30%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    <TextField value={customerName} label="Customer Name" onChange={(e) => setCustomerName(e.target.value)} required={true} />
                    <SelectField label="Gender" value={gender} onChange={(e) => setGender(genderEnum(e.target.value))} required={true} >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="undisclosed">Undisclosed</option>
                    </SelectField>

                </Grid>

                <Grid templateColumns={{ base: "100%", large: "70% 30%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    
                    <TextField value={dateOfBirth} label="Date of birth" type="date" onChange={(e) => setDateOfBirth(e.target.value)} required={true}
                        max={(new Date()).toISOString().substring(0,10)} />

                </Grid>

                <Grid templateColumns={{ base: "100%", large: "50% 50%" }} templateRows={{ base: "2rem", large: "2rem 2rem" }} width="100%" gap={tokens.space.small}>
                    <TextField value={legalId} label="Legal ID (NID)" onChange={(e) => setLegalId(e.target.value)} />
                    <PhoneNumberField inputMode="tel" defaultDialCode="+84" onDialCodeChange={(e) => setDialCode(e.target.value)} 
                        value={phoneNumber??''} label="Phone number" onChange={(e) => setPhoneNumber(e.target.value)}
                        hasError={"phoneNumber" == invalidField} />
                </Grid>
            </Fieldset>

            <View>
                {warningMessage ?
                    <Message colorTheme="warning">{warningMessage}</Message>
                    : null
                }
            </View>
            <View>
                <Grid templateColumns="1fr 1fr 1fr" autoColumns="100px" gap={tokens.space.small}>
                    <Button type="submit" variation="primary">{props?.customer?.customerId ? 'Save' : 'Add' }</Button>
                    <Button type="reset" onClick={props.cancelEdit}>Cancel</Button>
                </Grid>
            </View>
        </Flex>
        </form>
    </Card>
    );
}
