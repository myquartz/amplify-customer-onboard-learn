import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useTheme, Message, Grid, Card, Button, Flex, Fieldset, View, TextField, SelectField, PhoneNumberField, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

export default function CustomerSelfForm(props: {
        userProfile: AuthUser, checkProfile: Schema["checkIfAnAdmin"]["returnType"]
}) {

    const { tokens } = useTheme();

    const [invalidField, setInvalidField] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [customerId, setCustomerId] = useState('');
    const [dialCode, setDialCode] = useState('+84');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [legalId, setLegalId] = useState('');
    const [gender, setGender] = useState('undisclosed');

    useEffect(() => {
      setCustomerId(props.checkProfile?.requesterCustomerId || '');
      setCustomerName(props.checkProfile?.requesterFullName || '');
      setDateOfBirth('');
      setLegalId('');
      setGender('undisclosed');
      setPhoneNumber('');
    },[props.checkProfile]);

    function toCustObj(): Schema["Customer"]["type"] {
        const cust = {
          customerId,
          phoneNumber: dialCode+''+phoneNumber,
          customerName,
          dateOfBirth,
          legalId,
          gender: genderEnum(gender),
        } as Schema["Customer"]["type"];
  
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

    async function clickSubmitForm(event: any) {
        event.preventDefault();
        console.debug('phone',phoneNumber);
        if(phoneNumber && phoneNumber.length < 10) {
            setInvalidField('phoneNumber');
            setWarningMessage('Phone number error');
            return;
        }
        setWarningMessage('');
        /*const response = await client.mutations.selfOnboarding(toCustObj())
        console.debug('response',response);
        if(response.errors)
          setWarningMessage(JSON.stringify(response.errors));
        else {
          setSuccessMessage("Success created "+JSON.stringify(response.data));
          setCustomerId(response.data?.customerId??'-');
        }*/
    }

    return (
    <Card>
        <form onSubmit={clickSubmitForm} method="post">
        <Heading width='80vw' level={3}>Welcome to Customer Onboard demostration</Heading>
        <Flex direction="column" alignItems="flex-start">
            <Fieldset legend="Metadata" variation="plain" direction="column" width="100%">
                <Grid templateColumns={{ base: "100%", large: "60% 40%" }} templateRows={{ base: "2rem", large: "2rem" }} width="100%">
                    <View><em>Customer ID:</em> {customerId ? customerId : 'to be generated'}</View>
                    <View><em>Email:</em> {props?.userProfile.signInDetails?.loginId ? props?.userProfile.signInDetails?.loginId : '-' }</View>
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
                    : successMessage ?
                    <Message colorTheme="success">{successMessage}</Message>
                    : null
                }
            </View>
            <View>
                <Grid templateColumns="1fr 1fr 1fr" autoColumns="100px" gap={tokens.space.small}>
                    <Button type="submit" variation="primary">Submit</Button>
                    <Button type="reset">Cancel</Button>
                </Grid>
            </View>
        </Flex>
        </form>
    </Card>
    );
}
