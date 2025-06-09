import { ImageRequestDto } from "./image-request-dto.model";
import { PropertyType } from "./property-type.enum";

export interface UpdatePropertyRequestDto 
{
    title?: string;
    description?: string;
    noOfRooms?: string; 
    price?: number;
    city?: string;
    neighborhood?: string;
    address?: string;
    yearBuilt?: number;
    size?: number;
    latitude?: number | null;
    longitude?: number | null;
    propertyType: PropertyType;
    noOfFloors?: number;
    floorNo?: number;
    totalFloors?: number;
    images?: ImageRequestDto[];
    facilityIds?: number[];
    sellerId?: string;
    distanceToCityCenter?: number;
}