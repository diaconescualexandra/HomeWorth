export enum OfferStatus {
    IN_PROGRESS = 0,
    ACCEPTED = 1,
    DECLINED = 2,
    VIEWED = 3,
    EXPIRED = 4,
}

export interface OfferRequestDto {
    buyerId: number;
    offeredAmount: number;
    status: OfferStatus;
}