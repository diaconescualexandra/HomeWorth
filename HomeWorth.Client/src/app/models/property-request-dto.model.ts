import { FacilityDto } from "./facility-dto.model";
import { ImageRequestDto } from "./image-request-dto.model";
import { PropertyType } from "./property-type.enum";
import { PropertyViewDto } from "./property-view-dto.model";

export interface PropertyRequestDto {
  title: string;
  description: string;
  noOfRooms: string;
  price: number;
  city: string;
  neighborhood: string;
  address: string;
  yearBuilt: number;
  size: number;
  //date: Date;
  latitude: number | null;
  longitude: number | null;
  propertyType: PropertyType;
  noOfFloors?: number;
  floorNo?: number;
  totalFloors?: number;
  images:ImageRequestDto[];
  facilityIds?: number[];
  facilities?: FacilityDto[];
  views?: PropertyViewDto;
  sellerId: string;
  distanceToCityCenter?: number;
}