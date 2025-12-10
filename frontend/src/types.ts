export interface ButtonProps {
    title: string;
    onClick: (e: any) => void;
    disabled: boolean;
    loading?: boolean;
}

export interface FormProps {
    coin?: string;
    nft?: string;
}