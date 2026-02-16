export interface FeeMaster {
    _id: string;
    paymentMode: string[];
    defaultPaymentMode: string;
    feeHeads: FeeHead[];
    // Add other fields as needed
}

export interface FeeHead {
    _id: string;
    name: string;
    // ...
}
