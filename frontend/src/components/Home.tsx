import { useEffect, useState } from 'react'
import { OpenFormState, OperationType } from '../types';
import { useAccounts } from '@iota/dapp-kit';
import { Box, Card, Flex, Heading, Text, Grid, Link } from '@radix-ui/themes';
import Button from './Button';
import Form from './Form';
import { useForm } from '../hooks/useForm';
import { useNetworkVariable } from '../networkConfig';
import { IotaObjectResponse } from '@iota/iota-sdk/client';
import ParseAddress from '../utils/ParseAddress';

export const operations: OperationType[] = [
    {
        name: "Buy",
        description: "Buy Ticket",
    },
    {
        name: "BuyResale",
        description: "Buy Resale ticket",
    },
    {
        name: "Resale",
        description: "Resale Ticket",
    }
];

export default function Home() {
    const [openForm, setOpenForm] = useState<OpenFormState["openForm"]>("");
    const [ownedTicket, setOwnedTickets] = useState<IotaObjectResponse[]>([]);
    const { client } = useForm();
    const [address] = useAccounts();
    const packageId = useNetworkVariable("packageId" as never);
    useEffect(() => {
        (() => {
            if (address) {
                client
                    .getOwnedObjects({
                        owner: address.address,
                        filter: {
                            StructType: `${packageId}::live_concert::TicketNFT`,
                        },
                        options: {
                            showContent: true,
                        },
                    })
                    .then((res) => res.data)
                    .then((res) => {
                        console.log(res)
                        setOwnedTickets(res);
                    });
            }
        })()
    }, [address])
    return (
        <>
            <Flex direction={"column"} m={"6"} align={"center"}>
                {address ? (
                    <>
                        <Flex direction={"row"} align={"center"} wrap={"wrap"} gap={"4"}>
                            {operations.map(
                                (value, index) =>
                                    <Button
                                        key={index}
                                        title={value.description}
                                        onClick={() => {
                                            setOpenForm(value.name);
                                        }}
                                        disabled={false}
                                    />
                            )}
                        </Flex>
                    </>
                ) : (
                    <Flex justify={"center"} mt={"5"}>
                        <Heading align={"center"}>Please connect your wallet first</Heading>
                    </Flex>
                )}
                {openForm !== "" && <Form openForm={openForm} />}
            </Flex>
            {ownedTicket.length > 0 && <>
                <Heading my={"5"} ml={"5"}>Your Tickets</Heading>
                <Grid
                    columns="3"
                    gap="3"
                    rows="repeat(2)"
                    width="auto"
                    overflowX={"hidden"}
                    mx={"2"}
                >
                    {ownedTicket.map((ticket, index) => (
                        <Box key={index}>
                            <Card size="3" style={{ background: "#1e1e1e" }}>
                                <Flex direction={"column"}>
                                    <Text size={"4"} weight={"bold"}>
                                        {ticket?.data?.content?.fields?.ticket_type.map((code: number) => String.fromCharCode(code)).join('')}
                                    </Text>
                                    <Text size={"3"}>
                                        <span style={{ fontWeight: "700" }}>Price:</span>{" "}
                                        {ticket?.data?.content?.fields?.price}
                                    </Text>
                                    <Flex>
                                        <Text size={"3"}>
                                            <span style={{ fontWeight: "700" }}>Object ID:</span>{" "}
                                            <Link style={{ cursor: "pointer" }} target='blank' href={`https://explorer.rebased.iota.org/object/${ticket?.data?.content?.fields?.id?.id}?network=devnet`}>{ParseAddress(ticket?.data?.content?.fields?.id?.id)}</Link>
                                        </Text>
                                    </Flex>
                                    <Text size={"2"}>
                                        <span style={{ fontWeight: "700" }}>Resale Limit:</span>
                                        {ticket?.data?.content?.fields?.resale_limit}
                                    </Text>
                                </Flex>
                            </Card>
                        </Box>
                    ))}
                </Grid>
            </>}
        </>
    )
}
