import { useState } from "react";
import { FormProps } from "../types";
import { useNetworkVariable } from "../networkConfig";
import { useIotaClient, useSignAndExecuteTransaction } from "@iota/dapp-kit";

export const useForm = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const packageId = useNetworkVariable('packageId' as never);
    const creatorObjectId = useNetworkVariable('creatorObjectId' as never);
    const categoryObjectId = useNetworkVariable('categoryObjectId' as never);
    const totalTicketObjectId = useNetworkVariable('totalTicketObjectId' as never);
    const soldTicketObjectId = useNetworkVariable('soldTicketObjectId' as never);
    const client = useIotaClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [formData, setFormData] = useState<FormProps>({
        coin: "",
        creatorObject: "",
        category: "SILVER_TICKET",
        categoryObject: "",
        totalTicketObject: "",
        soldTicketObject: "",
        updatedPrice: "",
        nft: "",
        resalePrice: "",
        initiatedResaleId: "",
    })

    const updateFormData = (field: keyof FormProps, value: string) => {
        setIsError(false)
        setFormData((prevState => ({
            ...prevState,
            [field]: value
        })))
    }

    return {
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
        signAndExecuteTransaction
    }
}