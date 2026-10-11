export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric';

export type Transmission = 'Manual' | 'Automatic';

export type BodyType = 'Hatchback' | 'Sedan' | 'SUV';

export type CarCategoryFilter = 'All Cars' | BodyType;

export type PriceSort = 'none' | 'price-asc' | 'price-desc';

export type BudgetRange = 'any' | 'under-5' | '5-10' | '10-15' | '15-plus';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  kilometres: number;
  fuelType: FuelType;
  transmission: Transmission;
  price: number;
  location: string;
  bodyType: BodyType;
  image: string;
  color: string;
  owners: number;
  description: string;
}
