export interface ButtonProps {
    title:string,
    onClick: (e:any) => void,
    disabled: boolean
}

export interface FormProps {
    coin?: string,
    creatorObject?: string,
    category?: "SILVER_TICKET"| "GOLD_TICKET" | "PLATINIUM_TICKET",
    categoryObject?: string,
    totalTicketObject?: string,
    soldTicketObject?:string,
    updatedPrice?: string,
    nft?:string,
    resalePrice?:string,
    initiatedResaleId?:string,

}

export interface OpenFormState {
    openForm: "Buy" | "BuyResale" | "ChangePrice" | "Resale"| ""; 
}

export interface OperationType{
    name: OpenFormState["openForm"],
    description: string,
    path?:string
}