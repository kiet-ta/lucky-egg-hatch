import { IotaClient } from "@iota/iota-sdk/client";
import { FormProps, OpenFormState } from "../types";
import { Transaction } from "@iota/iota-sdk/transactions";

export default (
    e: any,
    openForm: OpenFormState["openForm"],
    formData: FormProps,
    setFormData: React.Dispatch<React.SetStateAction<FormProps>>,
    packageId: any,
    creatorObjectId: any,
    categoryObjectId: any,
    totalTicketObjectId: any,
    soldTicketObjectId: any,
    signAndExecuteTransaction: any,
    client: IotaClient,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setIsError: React.Dispatch<React.SetStateAction<boolean>>
) => {
    e.preventDefault();

    const validateInputs = () => {
        switch (openForm) {
            case "Buy":
                return formData.coin === "" ? false : true;
            case "BuyResale":
                return formData.coin === "" || formData.initiatedResaleId === "" ? false : true;
            case "ChangePrice":
                return formData.updatedPrice === "" ? false : true;
            case "Resale":
                return formData.resalePrice === "" || formData.nft === "" ? false : true;
        }
    }

    const getargs = (tx: Transaction) => {
        switch (openForm) {
            case "Buy":
                return [
                    [tx.object(formData.coin as string),
                    tx.object(creatorObjectId),
                    tx.pure.vector("u8", formData.category?.split('').map(char => char.charCodeAt(0))),
                    tx.object(categoryObjectId),
                    tx.object(totalTicketObjectId),
                    tx.object(soldTicketObjectId)], 'buy_ticket'
                ];
            case "BuyResale":
                return [
                    [tx.object(formData.coin as string),
                    tx.object(formData.initiatedResaleId as string)], 'buy_resale_ticket'
                ];
            case "ChangePrice":
                return [
                    [tx.object(creatorObjectId),
                    tx.pure.vector("u8", formData.category?.split('').map(char => char.charCodeAt(0))),
                    tx.pure.u64(formData.updatedPrice as string),
                    tx.object(categoryObjectId as string)], 'change_price'
                ];
            case "Resale":
                return [
                    [tx.object(formData.nft as string),
                    tx.pure.u64(formData.resalePrice as string)], 'resale_ticket'
                ];
        }
    }

    if (validateInputs()) {
        setLoading(true)
        const tx = () => {
            const tx = new Transaction();
            const [args, functionName] = getargs(tx);
            tx.setGasBudget(50000000);
            if (formData.category) {
                tx.moveCall({
                    target: `${packageId}::live_concert::${functionName}`,
                    args,
                });
            }
            return tx;
        };
        signAndExecuteTransaction(
            {
                transaction: tx(),
            },
            {
                onSuccess: ({ digest }: { digest: any }) => {
                    client
                        .waitForTransaction({ digest, options: { showEffects: true } })
                        .then(() => {
                            setFormData({
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
                            });
                            alert("Transaction successfull!");
                            setLoading(false);
                        });
                },
                onError: (error: any) => {
                    console.error("Failed to execute transaction", tx, error);
                    setLoading(false);
                    alert(`Error Occured: ${error.message}`);
                },
            },
        );
    }
    else setIsError(true)
}