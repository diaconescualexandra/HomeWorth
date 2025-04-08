import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-property',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-property.component.html',
  styleUrl: './add-property.component.css',
  standalone: true
})
export class AddPropertyComponent {
  
  addPropertyForm: FormGroup;
  selectedPropertyType: number = 0;
  years: number[] = [];
  neighborhoods: string[] = [];
  showInvalidFormMessage: boolean = false; 

  constructor (private fb : FormBuilder) {

    const currentYear = new Date().getFullYear();
    for(let year = currentYear; year>=1920; year--){
      this.years.push(year);
    }

    this.neighborhoods = ["Abbotsford", "Aberfeldie", "Airport West", "Albanvale", "Albert Park", "Albion", "Alphington", "Altona", "Altona Meadows", "Altona North", 
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
      "Williamstown North", "Windsor", "Wollert", "Wonga Park", "Wyndham Vale", "Yallambie", "Yarra Glen", "Yarraville"]



    this.addPropertyForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      noOfRooms:[null, [Validators.required, Validators.pattern(/^(1[0-5]|[1-9])$/)]],
      price: [null, [Validators.required, Validators.min(1), Validators.max(30000000)]],
      city: ["Melbourne", Validators.required],
      neighborhood:[null, Validators.required],
      address:['', Validators.required],
      yearBuilt: [currentYear, Validators.required],
      size: [null, [Validators.required, Validators.min(1), Validators.max(5000)]],
      date: [new Date()],
      latitude: [null],
      longitude: [null],
      propertyType: [null, Validators.required],
      noOfFloors: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^([1-5])$/)]],
      floorNo:[{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^(1[0-9]|2[0-5]|[1-9])$/)]],
    }, {updateOn: 'submit'});

    this.addPropertyForm.get('propertyType')?.valueChanges.subscribe((value) => {
      if (value == 1) {
        this.addPropertyForm.get('floorNo')?.enable();
        this.addPropertyForm.get('noOfFloors')?.disable();
      } else if (value == 2) {
        this.addPropertyForm.get('noOfFloors')?.enable();
        this.addPropertyForm.get('floorNo')?.disable();
      } else {
        this.addPropertyForm.get('floorNo')?.disable();
        this.addPropertyForm.get('noOfFloors')?.disable();
      }
    });

    this.addPropertyForm.statusChanges.subscribe(status => {
      if (status === 'VALID' && this.showInvalidFormMessage) {
        this.showInvalidFormMessage = false;
      }
    });
    
  }

  get formControl(){
    return this.addPropertyForm.controls;
  }

  isInvalid(controlName: string): boolean {
    const control = this.formControl[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  selectPropertyType(option: number):void {
    this.selectedPropertyType = option;
    this.addPropertyForm.get('propertyType')?.setValue(option);
  }
  
  
  addProperty() {
    if (this.addPropertyForm.valid) {
      console.log('Form submitted successfully');
      console.log(this.addPropertyForm.value);
      this.showInvalidFormMessage = false;

    } else {
      console.log('Form invalid');
      this.showInvalidFormMessage = true; // Show the message if form is invalid
    }
  }


}
