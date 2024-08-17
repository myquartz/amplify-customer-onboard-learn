//view customer profile from Schema["Customer"]

import { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

import { useTheme, Message, Grid, Card, Button, Flex, Fieldset, View, TextField, SelectField, PhoneNumberField, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { AuthUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

export default function CustomerView(props: {
    customerProfile: Schema["Customer"]["type"]
}) {

    return (
        <View>
            <Heading level={3}>Customer Details</Heading>
            <TextField label="Customer ID" value={props.customerProfile.customerId} isReadOnly />
            <TextField label="Customer Name" value={props.customerProfile.customerName} isReadOnly />
            <TextField label="Date of Birth" value={props.customerProfile.dateOfBirth} isReadOnly />
            <TextField label="Gender" value={props.customerProfile.gender??'-'} isReadOnly />
            <TextField label="Legal ID" value={props.customerProfile.legalId??'-'} isReadOnly />
            <TextField label="Phone Number" value={props.customerProfile.phoneNumber??'-'} isReadOnly />
            <TextField label="CIF Number" value={props.customerProfile.cifNumber??'-'} isReadOnly />
        </View>
    );
}