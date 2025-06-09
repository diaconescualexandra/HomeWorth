import { FacilityDto } from "./facility-dto.model";
import { ImageRequestDto } from "./image-request-dto.model";
import { OfferResponseDto } from "./offer-response-dto.model";
import { PropertyType } from "./property-type.enum";
import { PropertyViewDto } from "./property-view-dto.model";

export enum PropertyStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2
}
export interface PropertyResponseDto {
    propertyId: string; //TODO: guid
    title: string;
    description: string;
    noOfRooms: string;
    price: number;
    city: string;
    neighborhood: string;
    address: string;
    yearBuilt: number;
    size: number;
    date: Date;
    latitude: number | null;
    longitude: number | null;
    propertyType: PropertyType;
    noOfFloors?: number;
    floorNo?: number;
    totalFloors?: number;
    images?:ImageRequestDto[];
    facilities: FacilityDto[];
    views?: PropertyViewDto;
    offers? : OfferResponseDto[];
    sellerId: string;
    status: PropertyStatus;
    sellerFirstName?: string; 
    distanceToCityCenter?: number;
  }