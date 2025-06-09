import { CommonModule } from '@angular/common';
import { Component, Input, Output, OnInit, AfterViewInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl, FormArray } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PropertyRequestDto } from '../../../models/property-request-dto.model';
import { OnChanges, SimpleChanges } from '@angular/core';
import type * as LeafletType from 'leaflet';
import { FacilityDto } from '../../../models/facility-dto.model';
import { FacilityService } from '../../../services/facility.service';
import { PropertyType } from '../../../models/property-type.enum';
import { EstimatePriceService } from '../../../services/estimate-price.service';
declare let L: typeof LeafletType | undefined;

interface City {
  city: string;
  neighborhoods: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

@Component({
  selector: 'app-property-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './property-form.component.html',
  styleUrl: './property-form.component.css',
})

export class PropertyFormComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() property: PropertyRequestDto | null = null;
  @Input() submitButtonText: string = 'Submit';
  @Input() submitButtonColor: string = "block w-full shadow-md text-white font-bold py-2 px-4 border rounded-full mb-3 bg-blue-400 border-blue-600 hover:bg-blue-600"
  @Output() formSubmitted = new EventEmitter<PropertyRequestDto>(); 
  PropertyType = PropertyType;

  addPropertyForm!: FormGroup;
  selectedPropertyType: PropertyType = PropertyType.Flat;
  years: number[] = [];
  neighborhoods: string[] = [];
  showInvalidFormMessage: boolean = false;
  tooManyImages: boolean = false;
  fileInputTouched: boolean = false;
  private map: any;
  markers: LeafletType.Marker[] = [];
  cities: City[] = [];
  availableNeighborhoods: string[] = [];
  imagePreviews: string[] = [];
  estimatedPrice: string | null = null;
  facilities: FacilityDto[] = [];
  showFacilityDropdown: boolean = false;
  selectedFacilities: number[] = [];
  leafletLoaded: boolean = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private facilityService: FacilityService,
    private estimatePriceService: EstimatePriceService
  ) {}

  ngOnInit() {
    //this.initializeFromProperty();
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1920; year--) {
      this.years.push(year);
      

    }


    // Load facilities from the API
    this.loadFacilities();
    this.cities = [
        {
          city: "Melbourne",
          neighborhoods: ["Abbotsford", "Aberfeldie", "Airport West", "Albanvale", "Albert Park", "Albion", "Alphington", "Altona", "Altona Meadows", "Altona North", 
            "Ardeer", "Armadale", "Ascot Vale", "Ashburton", "Ashwood", "Aspendale", "Aspendale Gardens", "Attwood", "Avondale Heights", "Avonsleigh", "Bacchus Marsh", 
            "Balaclava", "Balwyn", "Balwyn North", "Bayswater", "Bayswater North", "Beaconsfield", "Beaconsfield Upper", "Beaumaris", "Belgrave", "Bellfield", "Bentleigh", 
            "Bentleigh East", "Berwick", "Black Rock", "Blackburn", "Blackburn North", "Blackburn South", "Bonbeach", "Boronia", "Botanic Ridge", "Box Hill", "Braybrook", 
            "Briar Hill", "Brighton", "Brighton East", "Broadmeadows", "Brookfield", "Brooklyn", "Brunswick", "Brunswick East", "Brunswick West", "Bulla", "Bulleen", 
            "Bullengarook", "Bundoora", "Burnley", "Burnside", "Burnside Heights", "Burwood", "Burwood East", "Cairnlea", "Camberwell", "Campbellfield", "Canterbury", 
            "Carlton", "Carlton North", "Carnegie", "Caroline Springs", "Carrum", "Carrum Downs", "Caulfield", "Caulfield East", "Caulfield North", "Caulfield South", 
            "Chadstone", "Chelsea", "Chelsea Heights", "Cheltenham", "Chirnside Park", "Clarinda", "Clayton", "Clayton South", "Clifton Hill", "Clyde North", "Coburg", 
            "Coburg North", "Coldstream", "Collingwood", "Coolaroo", "Craigieburn", "Cranbourne", "Cranbourne East", "Cranbourne North", "Cranbourne West", "Cremorne", 
            "Croydon", "croydon", "Croydon Hills", "Croydon North", "Croydon South", "Dallas", "Dandenong", "Dandenong North", "Darley", "Deepdene", "Deer Park", "Delahey", 
            "Derrimut", "Diamond Creek", "Diggers Rest", "Dingley Village", "Docklands", "Doncaster", "Doncaster East", "Donvale", "Doreen", "Doveton", "Eaglemont", 
            "East Melbourne", "Edithvale", "Elsternwick", "Eltham", "Eltham North", "Elwood", "Emerald", "Endeavour Hills", "Epping", "Essendon", "Essendon North", 
            "Essendon West", "Eumemmerring", "Eynesbury", "Fairfield", "Fawkner", "Fawkner Lot", "Ferntree Gully", "Ferny Creek", "Fitzroy", "Fitzroy North", "Flemington", 
            "Footscray", "Forest Hill", "Frankston", "Frankston North", "Frankston South", "Gardenvale", "Gisborne", "Gisborne South", "Gladstone Park", "Glen Huntly", 
            "Glen Iris", "Glen Waverley", "Glenroy", "Gowanbrae", "Greensborough", "Greenvale", "Guys Hill", "Hadfield", "Hallam", "Hampton", "Hampton East", "Hampton Park", 
            "Hawthorn", "Hawthorn East", "Healesville", "Heatherton", "Heathmont", "Heidelberg", "Heidelberg Heights", "Heidelberg West", "Highett", "Hillside", "Hopetoun Park", 
            "Hoppers Crossing", "Hughesdale", "Huntingdale", "Hurstbridge", "Ivanhoe", "Ivanhoe East", "Jacana", "Kalkallo", "Kealba", "Keilor", "Keilor Downs", "Keilor East", 
            "Keilor Lodge", "Keilor Park", "Kensington", "Kew", "Kew East", "Keysborough", "Kilsyth", "Kings Park", "Kingsbury", "Kingsville", "Knoxfield", "Kooyong", 
            "Kurunjang", "Lalor", "Langwarrin", "Laverton", "Lilydale", "Lower Plenty", "Lynbrook", "Lysterfield", "MacLeod", "Maidstone", "Malvern", "Malvern East", 
            "Maribyrnong", "McKinnon", "Meadow Heights", "Melbourne", "Melton", "Melton South", "Melton West", "Mentone", "Menzies Creek", "Mernda", "Mickleham", 
            "Middle Park", "Mill Park", "Mitcham", "Monbulk", "Mont Albert", "Montmorency", "Montrose", "Moonee Ponds", "Moorabbin", "Mooroolbark", "Mordialloc", 
            "Mount Evelyn", "Mount Waverley", "Mulgrave", "Murrumbeena", "Narre Warren", "New Gisborne", "Newport", "Niddrie", "Noble Park", "North Melbourne", 
            "North Warrandyte", "Northcote", "Notting Hill", "Nunawading", "Oak Park", "Oakleigh", "Oakleigh East", "Oakleigh South", "Officer", "Olinda", "Ormond", 
            "Pakenham", "Parkdale", "Parkville", "Pascoe Vale", "Patterson Lakes", "Plenty", "Plumpton", "Point Cook", "Port Melbourne", "Prahran", "Preston", "Princes Hill", 
            "Research", "Reservoir", "Richmond", "Riddells Creek", "Ringwood", "Ringwood East", "Ringwood North", "Ripponlea", "Rockbank", "Rosanna", "Rowville", "Roxburgh Park", 
            "Sandhurst", "Sandringham", "Scoresby", "Seabrook", "Seaford", "Seaholme", "Seddon", "Silvan", "Skye", "South Kingsville", "South Melbourne", "South Morang", 
            "South Yarra", "Southbank", "Spotswood", "Springvale", "Springvale South", "St Albans", "St Helena", "St Kilda", "Strathmore", "Strathmore Heights", "Suburb", 
            "Sunbury", "Sunshine", "Sunshine North", "Sunshine West", "Surrey Hills", "Sydenham", "Tarneit", "Taylors Hill", "Taylors Lakes", "Tecoma", "Templestowe", 
            "Templestowe Lower", "The Basin", "Thomastown", "Thornbury", "Toorak", "Travancore", "Truganina", "Tullamarine", "Upwey", "Vermont", "Vermont South", "Viewbank", 
            "viewbank", "Wallan", "Wandin North", "Wantirna", "Wantirna South", "Warrandyte", "Warranwood", "Waterways", "Watsonia", "Watsonia North", "Wattle Glen", "Werribee", 
            "Werribee South", "West Footscray", "West Melbourne", "Westmeadows", "Wheelers Hill", "Whittlesea", "Wildwood", "Williams Landing", "Williamstown", 
            "Williamstown North", "Windsor", "Wollert", "Wonga Park", "Wyndham Vale", "Yallambie", "Yarra Glen", "Yarraville"],
            coordinates: {
              latitude: -37.8136,
              longitude: 144.9631
            }
        },
        {
          city: "Vienna",
          neighborhoods: ["Innere Stadt", "Leopoldstadt", "Neubau", "Favoriten"],
          coordinates:{
            latitude: 48.2082,
            longitude: 16.3738}
        },
        {
          city: "Brussels",
          neighborhoods: ["Ixelles", "Saint-Gilles", "Etterbeek", "Uccle"],
          coordinates: { latitude: 50.8503, longitude: 4.3517 }
        },
        {
          city: "Sofia",
          neighborhoods: ["Lozenets", "Mladost", "Oborishte", "Vitosha"],
          coordinates: { latitude: 42.6977, longitude: 23.3219 }
        },
        {
          city: "Zagreb",
          neighborhoods: ["Donji Grad", "Maksimir", "Tresnjevka", "Medvescak"],
          coordinates: { latitude: 45.8150, longitude: 15.9819 }
        },
        {
          city: "Prague",
          neighborhoods: ["Old Town", "Vinohrady", "Zizkov", "Smichov"],
          coordinates: { latitude: 50.0755, longitude: 14.4378 }
        },
        {
          city: "Copenhagen",
          neighborhoods: ["Nørrebro", "Vesterbro", "Østerbro", "Frederiksberg"],
          coordinates: { latitude: 55.6761, longitude: 12.5683 }
        },
        {
          city: "Tallinn",
          neighborhoods: ["Kesklinn", "Kristiine", "Lasnamäe"],
          coordinates: { latitude: 59.4370, longitude: 24.7536 }
        },
        {
          city: "Helsinki",
          neighborhoods: ["Kallio", "Punavuori", "Kamppi", "Eira"],
          coordinates: { latitude: 60.1695, longitude: 24.9354 }
        },
        {
          city: "Paris",
          neighborhoods: ["Le Marais", "Montmartre", "Latin Quarter", "La Défense"],
          coordinates: { latitude: 48.8566, longitude: 2.3522 }
        },
        {
          city: "Berlin",
          neighborhoods: ["Mitte", "Kreuzberg", "Prenzlauer Berg", "Charlottenburg"],
          coordinates: { latitude: 52.5200, longitude: 13.4050 }
        },
        {
          city: "Athens",
          neighborhoods: ["Plaka", "Kolonaki", "Koukaki", "Exarchia"],
          coordinates: { latitude: 37.9838, longitude: 23.7275 }
        },
        {
          city: "Budapest",
          neighborhoods: ["District V", "District VII", "District XIII", "District II"],
          coordinates: { latitude: 47.4979, longitude: 19.0402 }
        },
        {
          city: "Reykjavík",
          neighborhoods: ["Miðborg", "Vesturbær", "Laugardalur"],
          coordinates: { latitude: 64.1355, longitude: -21.8954 }
        },
        {
          city: "Dublin",
          neighborhoods: ["Temple Bar", "Ballsbridge", "Rathmines", "Phibsborough"],
          coordinates: { latitude: 53.3498, longitude: -6.2603 }
        },
        {
          city: "Rome",
          neighborhoods: ["Trastevere", "Prati", "Testaccio", "Monti"],
          coordinates: { latitude: 41.9028, longitude: 12.4964 }
        },
        {
          city: "Riga",
          neighborhoods: ["Centrs", "Teika", "Ķengarags", "Āgenskalns"],
          coordinates: { latitude: 56.9496, longitude: 24.1052 }
        },
        {
          city: "Vilnius",
          neighborhoods: ["Old Town", "Žvėrynas", "Antakalnis", "Naujamiestis"],
          coordinates: { latitude: 54.6872, longitude: 25.2797 }
        },
        {
          city: "Luxembourg City",
          neighborhoods: ["Ville Haute", "Gare", "Belair"],
          coordinates: { latitude: 49.6117, longitude: 6.1319 }
        },
        {
          city: "Valletta",
          neighborhoods: ["Valletta", "Floriana"],
          coordinates: { latitude: 35.8997, longitude: 14.5146 }
        },
        {
          city: "Chisinau",
          neighborhoods: ["Centru", "Riscani", "Botanica"],
          coordinates: { latitude: 47.0105, longitude: 28.8638 }
        },
        {
          city: "Monaco",
          neighborhoods: ["Monte Carlo", "La Condamine", "Fontvieille"],
          coordinates: { latitude: 43.7384, longitude: 7.4246 }
        },
        {
          city: "Podgorica",
          neighborhoods: ["Centar", "Preko Morače", "Blok 5"],
          coordinates: { latitude: 42.4304, longitude: 19.2594 }
        },
        {
          city: "Amsterdam",
          neighborhoods: ["Jordaan", "De Pijp", "Oud-Zuid", "Westerpark"],
          coordinates: { latitude: 52.3676, longitude: 4.9041 }
        },
        {
          city: "Skopje",
          neighborhoods: ["Centar", "Karpoš", "Aerodrom"],
          coordinates: { latitude: 41.9981, longitude: 21.4254 }
        },
        {
          city: "Oslo",
          neighborhoods: ["Grünerløkka", "Frogner", "Majorstuen", "Gamle Oslo"],
          coordinates: { latitude: 59.9139, longitude: 10.7522 }
        },
        {
          city: "Warsaw",
          neighborhoods: ["Śródmieście", "Mokotów", "Praga", "Żoliborz"],
          coordinates: { latitude: 52.2297, longitude: 21.0122 }
        },
        {
          city: "Lisbon",
          neighborhoods: ["Alfama", "Chiado", "Bairro Alto", "Parque das Nações"],
          coordinates: { latitude: 38.7169, longitude: -9.1399 }
        },
        {
          city: "Bucharest",
          neighborhoods: ["Old Town", "Dorobanți", "Drumul Taberei", "Titan"],
          coordinates: { latitude: 44.4268, longitude: 26.1025 }
        },
        {
          city: "Moscow",
          neighborhoods: ["Arbat", "Tverskoy", "Zamoskvorechye", "Khamovniki"],
          coordinates: { latitude: 55.7558, longitude: 37.6173 } }
       ]
    

       this.availableNeighborhoods = this.cities[0].neighborhoods; 

       this.addPropertyForm = new FormGroup({
         title: new FormControl(this.property?.title || '', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
         description: new FormControl(
           this.property?.description || '',
           [Validators.required, Validators.maxLength(500), Validators.minLength(10)]
         ),
         noOfRooms: new FormControl(this.property?.noOfRooms || '', [
           Validators.required,
           Validators.pattern(/^(1[0-5]|[1-9])$/),
         ]),
         price: new FormControl(this.property?.price || '', [
           Validators.required,
           Validators.min(1),
           Validators.max(30000000),
         ]),
         city: new FormControl(
           this.property?.city || 'Melbourne',
           Validators.required
         ),
         neighborhood: new FormControl(
           this.property?.neighborhood || '',
           Validators.required
         ),
         address: new FormControl(
           this.property?.address || '',
           Validators.required
         ),
         yearBuilt: new FormControl(
           this.property?.yearBuilt || currentYear,
           Validators.required
         ),
         size: new FormControl(this.property?.size || '', [
           Validators.required,
           Validators.min(1),
           Validators.max(5000),
         ]),
         distanceToCityCenter: new FormControl(this.property?.distanceToCityCenter || '', [
          Validators.required,
         ]),
         latitude: new FormControl(this.property?.latitude || null),
         longitude: new FormControl(this.property?.longitude || null),
         propertyType: new FormControl(
          this.property?.propertyType || PropertyType.Flat, // Default to Flat instead of null
          Validators.required
        ),
         noOfFloors: new FormControl({ value: this.property?.noOfFloors || '', disabled: true }, [
           Validators.required,
           Validators.pattern(/^([1-5])$/),
         ]),
         floorNo: new FormControl({ value: this.property?.floorNo || '', disabled: true }, [
           Validators.required,
           Validators.pattern(/^(0|[1-9]|1[0-9]|2[0-5])$/),
         ]),
         totalFloors: new FormControl({ value: this.property?.totalFloors || '', disabled: true }, [
           Validators.required,
           Validators.pattern(/^(1[0-9]|2[0-5]|[1-9])$/),
         ]),
         images: new FormArray([], Validators.required),
         facilityIds: new FormControl([], Validators.required),
       });
   
       this.addPropertyForm
        .get('propertyType')
        ?.valueChanges.subscribe((value: PropertyType) => { // Specify the type
          this.updateFieldsBasedOnPropertyType(value);
        });
   
       this.addPropertyForm.statusChanges.subscribe((status) => {
         if (status === 'VALID' && this.showInvalidFormMessage) {
           this.showInvalidFormMessage = false;
         }
       });
  
  }

  applyEstimate() {
  // Extract numeric value from estimatedPrice (removes currency symbols, commas)
  if (!this.estimatedPrice) {
    console.warn('Estimated price is not available');
    return;
  }
  const numericValue = this.estimatedPrice.replace(/[^0-9.]/g, '');
  
  if (numericValue) {
    this.addPropertyForm.patchValue({
      price: numericValue
    });
  }
}

async estimatePrice(): Promise<void> {
  this.estimatedPrice = 'Estimating...';
  
  const formValues = this.addPropertyForm.value;
  const city = formValues.city.trim().toLowerCase();

  const payload = {
    Suburb: formValues.neighborhood,
    Type: formValues.propertyType.toString(),
    Rooms: Number(formValues.noOfRooms),
    Distance: Number(formValues.distanceToCityCenter),
    Landsize: Number(formValues.size),
  };

  if (city === 'melbourne') {
    this.estimatePriceService.estimateMelbournePrice(payload).subscribe({
      next: (response) => {
        if (response.error) {
          this.estimatedPrice = response.error;
        } else {
          const price = response.estimated_price;
          this.estimatedPrice = `$${price.toLocaleString()}`;
          // Auto-fill the price field
          this.addPropertyForm.patchValue({
            price: price
          });
        }
      },
      error: (error) => {
        console.error('Estimation error:', error);
        this.estimatedPrice = 'Estimation failed';
      }
    });
  } else {
    this.estimatePriceService.estimateOtherCityPrice(payload, city).subscribe({
      next: (response) => {
        if (response.error) {
          this.estimatedPrice = response.error;
        } else {
          const aiEstimate = response.choices?.[0]?.message?.content?.trim();
          this.estimatedPrice = aiEstimate || 'No response from AI.';
          
          // Try to extract numeric value from AI response
          const numericValue = this.extractNumericValue(aiEstimate);
          if (numericValue) {
            this.addPropertyForm.patchValue({
              price: numericValue
            });
          }
        }
      },
      error: (error) => {
        console.error('Estimation error:', error);
        this.estimatedPrice = 'Estimation failed';
      }
    });
  }
}

// Helper method to extract numeric value from AI response
private extractNumericValue(text: string): number | null {
  if (!text) return null;
  
  // Match first number in the string (handles currency symbols, commas)
  const match = text.match(/(\d[\d,.]*)/);
  if (match) {
    // Remove commas and convert to number
    return parseFloat(match[0].replace(/,/g, ''));
  }
  return null;
}

     private loadFacilities() {
       this.facilityService.getAllFacilities()
         .subscribe({
           next: (facilities) => {
             console.log('Facilities loaded:', facilities);
             this.facilities = facilities;
             this.initializeFromProperty();
           },
           error: (error) => {
             console.error('Error loading facilities:', error);
             // Fallback to default facilities if API fails
            //  this.facilities = [
            //    { facility_id: 1, facilityName: 'Swimming Pool' },
            //    { facility_id: 2, facilityName: 'Gym' },
            //    { facility_id: 4, facilityName: 'Security' },
            //    { facility_id: 5, facilityName: 'Elevator' }
            //  ];
            this.initializeFromProperty()
           }
         });
     }
     private setupCityChangeListener() {
      // Add a flag to track initial form setup
      let isInitialSetup = true;
      
      this.addPropertyForm.get('city')?.valueChanges.subscribe((selectedCity: string) => {
        if (!selectedCity || !L) return;
    
        const cityData = this.cities.find(c => c.city === selectedCity);
        if (cityData) {
          // Update neighborhoods
          this.availableNeighborhoods = cityData.neighborhoods;
          
          // Only reset neighborhood if it's not the initial setup
          if (isInitialSetup) {
            // Don't reset neighborhood on initial load
            isInitialSetup = false;
            
            // Just update coordinates without touching neighborhood
            this.addPropertyForm.patchValue({
              latitude: cityData.coordinates.latitude,
              longitude: cityData.coordinates.longitude
            });
          } else {
            // For subsequent city changes, clear neighborhood
            this.addPropertyForm.patchValue({
              neighborhood: '',
              latitude: cityData.coordinates.latitude,
              longitude: cityData.coordinates.longitude
            });
          }
          
          this.updateMapForCity(cityData);
        }
      });
    }

    private updateMapForCity(cityData: City) {
      if (!L || !this.map) {
        console.error('Map or Leaflet not initialized');
        return;
      }
  
      console.log('Updating map for city:', cityData.city);
      
      // Center map on new coordinates
      this.map.setView(
        [cityData.coordinates.latitude, cityData.coordinates.longitude], 
        12
      );
      // Update marker position
      if (this.markers.length > 0) {
        console.log('Moving existing marker');
        this.markers[0].setLatLng([
          cityData.coordinates.latitude, 
          cityData.coordinates.longitude
        ]);
      } else {
        console.log('Creating new marker');
        const newMarker = L.marker([
          cityData.coordinates.latitude, 
          cityData.coordinates.longitude
        ]).addTo(this.map);
        this.markers = [newMarker];
      }
      }
      async ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
          try {
            // Wait a bit to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Dynamically import Leaflet
            const leaflet = await import('leaflet');
            L = leaflet.default || leaflet;
            this.leafletLoaded = true;
        
            // Fix icon paths with absolute URLs
            const iconRetinaUrl = '/assets/marker-icon-2x.png';
            const iconUrl = '/assets/marker-icon.png';
            const shadowUrl = '/assets/marker-shadow.png';
            const iconDefault = leaflet.icon({
              iconRetinaUrl,
              iconUrl,
              shadowUrl,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              tooltipAnchor: [16, -28],
              shadowSize: [41, 41]
            });
            leaflet.Marker.prototype.options.icon = iconDefault;
            
            // Initialize map - only do this once
            if (!this.map) {
              await this.initMap();
              
              // Now we can set up the listeners that depend on the map
              this.setupCityChangeListener();
              
              // Add a click event handler to the map
              if (this.map) {
                this.map.on('click', (event: LeafletType.LeafletMouseEvent) => {
                  this.markerPlacement(event);
                });
              }
              
              // Add initial marker
              if (this.map) {
                const initialCity = this.cities.find(c => c.city === this.addPropertyForm.get('city')?.value) || this.cities[0];
                const initialMarker = L.marker([
                  initialCity.coordinates.latitude,
                  initialCity.coordinates.longitude
                ]).addTo(this.map);
                this.markers = [initialMarker];
                
                // Center the map on the marker
                this.centerMap();
              }
            }
            if (this.property && this.property.latitude && this.property.longitude) {
              // Center the map on the property's coordinates
              this.map.setView(
                [this.property.latitude, this.property.longitude],
                12
              );
              // Place marker at the property's coordinates
              if (this.markers.length > 0) {
                this.markers[0].setLatLng([this.property.latitude, this.property.longitude]);
              } else {
                const marker = L.marker([this.property.latitude, this.property.longitude]).addTo(this.map);
                this.markers = [marker];
              }
            }
          } catch (error) {
            console.error('Error loading Leaflet:', error);
          }
        }
      }
    
   
      private centerMap() {
        if (!L || !this.map || this.markers.length === 0) return;
        
        // Create a boundary based on the markers
        const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
        
        // Fit the map into the boundary
        this.map.fitBounds(bounds);
      }
   
      private async initMap(): Promise<void> {
        try {
          if (typeof L === 'undefined') {
            console.error('Leaflet is not loaded');
            return;
          }
          const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        
          const mapElement = document.getElementById('map');
          if (!mapElement) {
            console.error('Map container element not found');
            return;
          }
        
          //  Clear previous map instance if it exists
          if (this.map) {
            this.map.remove();
            this.map = undefined;
          }
        
          // 🛠️ Clear Leaflet's internal reference if needed
          if ((mapElement as any)._leaflet_id) {
            delete (mapElement as any)._leaflet_id;
          }
        
          this.map = L.map('map');
        
          const initialCity =
            this.cities.find(c => c.city === this.addPropertyForm.get('city')?.value) || this.cities[0];
        
          this.map.setView(
            [initialCity.coordinates.latitude, initialCity.coordinates.longitude],
            12
          );
        
          L.tileLayer(baseMapURl, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);
        
          console.log('Map initialized successfully');
        } catch (error) {
          console.error('Error initializing map:', error);
          if (this.map) {
            this.map.remove();
            this.map = undefined;
          }
        }
      }
   
      ngOnDestroy() {
        if (this.map) {
          console.log('Cleaning up map');
          this.map.remove();
          this.map = undefined;
          this.markers = [];
        }
      }
     
      markerPlacement(event: LeafletType.LeafletMouseEvent) {
        if (!L || !this.map) return;
      
        // If the markers array is not empty, update the position of the existing marker
        if (this.markers.length > 0) {
          const existingMarker = this.markers[0];
          existingMarker.setLatLng(event.latlng);  // Update the marker position
        } else {
          // Create a new marker using the default Leaflet icon
          const newMarker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(this.map);
          this.markers.push(newMarker);  // Add the marker to the markers array
        }
      
        // Update the form fields for latitude and longitude
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
      
        if (this.property) {
          this.property.latitude = lat;
          this.property.longitude = lng;
        }
        
        console.log('Latitude:', lat, 'Longitude:', lng);
    
        this.addPropertyForm.controls['latitude'].setValue(lat);
        this.addPropertyForm.controls['longitude'].setValue(lng);
      }
     
      private initializeFromProperty(): void {
        if (this.property) {
          // Create a copy of the property object without modifying the original
          const propertyWithoutImages = { ...this.property };
          
          // Initialize facilityIds array
          let facilityIds: number[] = [];
          
          // Extract facilityIds from facilities array if it exists
          if (this.property.facilities && Array.isArray(this.property.facilities)) {
            facilityIds = this.property.facilities.map(f => f.facility_id);
            console.log('Extracted facilityIds from facilities array:', facilityIds);
          } 
          // Or use existing facilityIds if provided directly
          else if (this.property.facilityIds && Array.isArray(this.property.facilityIds)) {
            facilityIds = this.property.facilityIds.map(id => +id);
            console.log('Using existing facilityIds:', facilityIds);
          }
          
          // Update component state
          this.selectedFacilities = [...facilityIds];
          
          // Remove facilities from form object (not needed in form)
          delete propertyWithoutImages.facilities;
          
          // Set facilityIds for the form
          propertyWithoutImages.facilityIds = facilityIds;
          
          // Patch the form with all values
          this.addPropertyForm.patchValue(propertyWithoutImages);
          
          // Set available neighborhoods for the property's city
          const cityData = this.cities.find(c => c.city === this.property!.city);
          if (cityData) {
            this.availableNeighborhoods = cityData.neighborhoods;
          }
          
          // Handle property type
          if (this.property.propertyType !== undefined && this.property.propertyType !== null) {
            this.selectPropertyType(this.property.propertyType as PropertyType);
          }
          
          // Explicitly set facilityIds again to ensure it takes
          this.addPropertyForm.patchValue({
            facilityIds: facilityIds
          });
          
          // Handle images separately
          if (this.property.images && this.property.images.length > 0) {
            // Clear existing images
            this.images.clear();
            this.imagePreviews = [];
            
            // Process each image in the property's images array
            this.property.images.forEach((image, index) => {
              if (image && image.imageUrl) {
                this.imagePreviews.push(image.imageUrl);
                
                // Add to form control
                this.images.push(new FormControl(image, Validators.required));
              }
            });
          }
          
          // Force update after a short delay to ensure Angular CD cycle completes
          setTimeout(() => {
            this.addPropertyForm.get('facilityIds')?.setValue(facilityIds);
            this.addPropertyForm.get('facilityIds')?.updateValueAndValidity();
          }, 0);
        }
      }
   
     ngOnChanges(changes: SimpleChanges) {
      if (changes['property']?.currentValue) {
        console.log('Property changed:', changes['property'].currentValue);
        console.log('Property facilityIds:', changes['property'].currentValue.facilityIds);
        
        if (this.addPropertyForm) {
          this.initializeFromProperty();
        } }
     }
   
     get formControl() {
       return this.addPropertyForm.controls;
     }
   
     get images() {
       return this.addPropertyForm.get('images') as FormArray;
     }
     
     toggleFacilityDropdown() {
       this.showFacilityDropdown = !this.showFacilityDropdown;
     }
   
     getSelectedFacilitiesText(): string {
       if (!this.selectedFacilities.length) {
         return 'Select facilities';
       }
       const selectedNames = this.facilities
         .filter(f => this.selectedFacilities.includes(f.facility_id))
         .map(f => f.facilityName);
       return selectedNames.join(', ');
     }
   
     isChecked(facilityId: number): boolean {
      const facilityIdNumber = +facilityId;
      const formValue = this.addPropertyForm.get('facilityIds')?.value || [];
      
      // Convert all IDs to numbers for consistent comparison
      const hasId = formValue.some((id: any) => +id === facilityIdNumber);
      const inSelected = this.selectedFacilities.includes(facilityIdNumber);
      
      return hasId || inSelected;
    }
   
    onFacilityChange(event: any) {
      const facilityId = +event.target.value;
      const isChecked = event.target.checked;
      
      // Create a new array from existing selected facilities
      let currentFacilityIds = [...this.selectedFacilities];
      
      if (isChecked) {
        // Add the facility if it's not already in the array
        if (!currentFacilityIds.includes(facilityId)) {
          currentFacilityIds.push(facilityId);
        }
      } else {
        // Remove the facility
        currentFacilityIds = currentFacilityIds.filter(id => id !== facilityId);
      }
      
      // Update component state
      this.selectedFacilities = currentFacilityIds;
      
      // Update form control
      this.addPropertyForm.get('facilityIds')?.setValue(currentFacilityIds);
      this.addPropertyForm.get('facilityIds')?.markAsDirty();
      
      console.log('Updated facilityIds:', currentFacilityIds);
    }
   
     @HostListener('document:click', ['$event'])
     onClick(event: Event) {
       const dropdown = document.querySelector('.relative');
       if (!dropdown?.contains(event.target as Node)) {
         this.showFacilityDropdown = false;
       }
     }
   
     imageSelect(event: any) {
       const files = event.target.files;
   
       this.fileInputTouched = true;
       
       // Only proceed if files were selected
       if (files && files.length > 0) {
         if (files.length <= 8) {
           this.images.clear();
           this.imagePreviews = [];
           
           for (let i = 0; i < files.length; i++) {
             const file = files[i];
             this.images.push(new FormControl(file, Validators.required));
             
             // Create preview URL
             const reader = new FileReader();
             reader.onload = (e: any) => {
               this.imagePreviews[i] = e.target.result;
             };
             reader.readAsDataURL(file);
           }
           this.tooManyImages = false;
         } else {
           // If more than 8 files are selected, only add the first 8
           this.tooManyImages = true;
           for (let i = 0; i < 8; i++) {
             this.images.push(new FormControl(files[i], Validators.required));
           }
         }
       }
     }
   
     //helper method for validation checks
     isInvalid(controlName: string): boolean {
       if (controlName === 'images') {
         const control = this.addPropertyForm.get('images') as FormArray;
         return control.invalid && (this.fileInputTouched || control.touched);
       }
       const control = this.formControl[controlName];
       return control.invalid && (control.dirty || control.touched);
     }
   
     selectPropertyType(option: PropertyType): void {
      this.selectedPropertyType = option;
      this.addPropertyForm.get('propertyType')?.setValue(option);
      this.updateFieldsBasedOnPropertyType(option);
    }
   
     submitForm() {
      if (this.addPropertyForm.valid) {
        // Get form values
        const formValues = this.addPropertyForm.value;
        
        // If we have a property object from backend, use it as a base
        // to preserve any fields we're not explicitly handling
        const finalProperty: PropertyRequestDto = this.property ? 
          { ...this.property } : 
          { ...formValues };
        
        // Override with form values
        Object.assign(finalProperty, formValues);
        
        // Ensure we're sending facilityIds, not facilities
        if (finalProperty.facilities) {
          delete finalProperty.facilities;
        }
        
        console.log('Form submitted successfully:', finalProperty);
        this.showInvalidFormMessage = false;
        this.formSubmitted.emit(finalProperty);
      } else {
        console.log('Form invalid');
        this.showInvalidFormMessage = true;
        
        // Mark all controls as touched to show validation errors
        Object.keys(this.addPropertyForm.controls).forEach(key => {
          const control = this.addPropertyForm.get(key);
          control?.markAsTouched();
        });
      }
    }
   
     onKeyDown(event: KeyboardEvent): void {
       if (event.key === 'Delete' || event.keyCode === 46) {
         if (this.imagePreviews.length > 0) {
           this.images.removeAt(this.images.length - 1);
         }
       }
     }
     
     // Method to handle the removal of a specific file
     removeFile(index: number): void {
       this.images.removeAt(index);
       this.imagePreviews.splice(index, 1); // Remove corresponding form control
       if (this.images.length <= 8) {
         this.tooManyImages = false;
       }
     }
   
     private updateFieldsBasedOnPropertyType(propertyType: PropertyType): void {
      if (propertyType === PropertyType.Flat) {
        this.addPropertyForm.get('floorNo')?.enable();
        this.addPropertyForm.get('totalFloors')?.enable();
        this.addPropertyForm.get('noOfFloors')?.disable();
      } else if (propertyType === PropertyType.House) {
        this.addPropertyForm.get('noOfFloors')?.enable();
        this.addPropertyForm.get('floorNo')?.disable();
        this.addPropertyForm.get('totalFloors')?.disable();
      } else {
        this.addPropertyForm.get('floorNo')?.disable();
        this.addPropertyForm.get('noOfFloors')?.disable();
        this.addPropertyForm.get('totalFloors')?.disable();
      } }
   }