//view customer profile from Schema["Customer"]

import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useTheme, Message, Grid, Card, Button, Flex, Fieldset, View, TextField, SelectField, PhoneNumberField, Heading, Placeholder } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import moment from 'moment';

const client = generateClient<Schema>({
    authMode: "userPool"
});

export default function CustomerView(props: {
    customerProfile: Schema["Customer"]["type"]
}) {

    const { tokens } = useTheme();
    const [message, setMessage] = useState('');

    async function sendNotify() {
        try {
            const { data, errors } = await client.mutations.sendNotify({
                customerId: props.customerProfile.customerId
            });
            if(errors) {
                setMessage("Error "+JSON.stringify(errors, null, 2))
            }
            else { 
                setMessage("Sent "+JSON.stringify(data, null, 2))
                setTimeout(() => { setMessage('') }, 5000);
            }
        }
        catch(err) {
            setMessage("Error: "+err);
        }
    }

    return (
        <View>
            <Heading level={3}>Customer Details</Heading>
            <Grid
                gap={{'base': tokens.space.small, 'large': tokens.space.medium }}
                templateColumns={{'small': '1fr', 'medium': '1fr 1fr'}}
                templateRows="1fr"
                >
            <TextField label="Customer ID" value={props.customerProfile.customerId} isReadOnly />
            <TextField label="CIF Number" value={props.customerProfile.cifNumber??'-'} isReadOnly />
            <TextField label="Customer Name" value={props.customerProfile.customerName} isReadOnly />
            <TextField label="Date of Birth" value={props.customerProfile.dateOfBirth} isReadOnly />
            <TextField label="Gender" value={props.customerProfile.gender??'-'} isReadOnly />
            <TextField label="Legal ID" value={props.customerProfile.legalId??'-'} isReadOnly />
            <TextField label="Phone Number" value={props.customerProfile.phoneNumber??'-'} isReadOnly />
            <TextField label="created at" value={props.customerProfile.createdAt?
                     moment(props.customerProfile.createdAt).local().format('YYYY-MM-DD HH:mm:ss'):''} type="datetime-local" isReadOnly />
            </Grid>

            <hr />
            <Flex marginTop={{'base': tokens.space.small, 'large': tokens.space.medium }}
                direction="column">
                { message ? <Message variation="outlined" colorTheme="info">{message}</Message> : null}
                <Button onClick={sendNotify}>Engaged</Button>
            </Flex>
        </View>
    );
}