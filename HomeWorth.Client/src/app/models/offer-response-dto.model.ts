export enum OfferStatus {
    IN_PROGRESS = 0,
    ACCEPTED = 1,
    DECLINED = 2,
    VIEWED = 3,
    EXPIRED = 4,
}

export interface OfferResponseDto {
    offerId:number;
    propertyId: string;
    buyerId: number;
    offeredAmount: number;
    status: OfferStatus;
    phoneNumber?: string;
    email?: string;
    showBuyerInfo?: boolean; 
    firstName?: string;
    lastName?: string;
    propertyTitle?: string;
    createdAt: Date;
}