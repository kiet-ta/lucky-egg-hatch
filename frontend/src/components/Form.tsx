import * as Form from "@radix-ui/react-form";
import styles from "../style";
import Button from "./Button";
import { OpenFormState } from "../types";
import { Box, DropdownMenu, TextField } from "@radix-ui/themes";
import { useForm } from "../hooks/useForm";
import  submitForm  from "../utils/submitForm";
import { Button as RadixButton } from "@radix-ui/themes";

const InputForm = ({ openForm }: { openForm: OpenFormState["openForm"] }) => {
    const { 
        loading, 
        setLoading, 
        formData, 
        setFormData, 
        updateFormData, 
        isError, 
        setIsError, 
        packageId,
        creatorObjectId,
        categoryObjectId,
        totalTicketObjectId,
        soldTicketObjectId,
        client,
        signAndExecuteTransaction } = useForm();

    return (
        <div style={styles.formContainer}>
            <h1 style={{ textAlign: "center" }}>{openForm}</h1>
            <Form.Root style={styles.formRoot}>
                {(openForm === "Buy" || openForm === "BuyResale") && (
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>IOTA Coin ID</Form.Label>
                        <Form.Control asChild>
                            <TextField.Root
                                size="2"
                                placeholder="0X2::coin::IOTA"
                                value={formData.coin}
                                onChange={(e) => updateFormData("coin", e.target.value)}
                            />
                        </Form.Control>
                    </Form.Field>
                )}

                {(openForm === "Buy" || openForm === "ChangePrice") && (
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>Category</Form.Label>
                        <Form.Control asChild>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger>
                                    <RadixButton color="blue" variant="soft" style={{ width: "20%" }}>
                                        {formData.category ? formData.category : "Options"}
                                        <DropdownMenu.TriggerIcon />
                                    </RadixButton>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content>
                                    <DropdownMenu.Item onClick={e => updateFormData("category", "SILVER_TICKET")}>Silver</DropdownMenu.Item>
                                    <DropdownMenu.Item onClick={e => updateFormData("category", "GOLD_TICKET")}>Gold</DropdownMenu.Item>
                                    <DropdownMenu.Item onClick={e => updateFormData("category", "PLATINIUM_TICKET")}>Platinium</DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>

                        </Form.Control>
                    </Form.Field>
                )}

                {openForm === "ChangePrice" && (
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>Update Price</Form.Label>
                        <Form.Control asChild>
                            <TextField.Root
                                value={formData.updatedPrice}
                                onChange={(e) => updateFormData("updatedPrice", e.target.value)}
                                size="2"
                                placeholder="Price"
                            />
                        </Form.Control>
                    </Form.Field>
                )}
                {openForm === "Resale" && (
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>Resale Price</Form.Label>
                        <Form.Control asChild>
                            <TextField.Root
                                value={formData.resalePrice}
                                onChange={(e) => updateFormData("resalePrice", e.target.value)}
                                size="2"
                                placeholder="Price"
                            />
                        </Form.Control>
                    </Form.Field>
                )}

                {openForm === "Resale" &&
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>NFT ID</Form.Label>
                        <Form.Control asChild>
                            <TextField.Root
                                value={formData.nft}
                                onChange={(e) => updateFormData("nft", e.target.value)}
                                size="2"
                                placeholder="NFT Id"
                            />
                        </Form.Control>
                    </Form.Field>
                }

                {openForm === "BuyResale" && (
                    <Form.Field name="" style={styles.formField}>
                        <Form.Label style={styles.formLabel}>
                            Initiated Resell ID
                        </Form.Label>
                        <Form.Control asChild>
                            <TextField.Root
                                value={formData.initiatedResaleId}
                                onChange={(e) =>
                                    updateFormData("initiatedResaleId", e.target.value)
                                }
                                size="2"
                                placeholder="Initialed Resell"
                            />
                        </Form.Control>
                    </Form.Field>
                )}
                <Box style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        disabled={loading}
                        onClick={(e) => submitForm(
                            e,
                            openForm,
                            formData,
                            setFormData,
                            packageId,
                            creatorObjectId,
                            categoryObjectId,
                            totalTicketObjectId,
                            soldTicketObjectId,
                            signAndExecuteTransaction,
                            client,
                            setLoading,
                            setIsError
                        )}
                        title={"Submit"}
                    />
                </Box>
                <Box>
                    {isError && <p style={{ fontSize: "small", color: "red" }}>{"All fields are mandatory*"}</p>}
                </Box>
            </Form.Root>
        </div>
    );
};

export default InputForm;
