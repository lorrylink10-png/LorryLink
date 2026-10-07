export type UserRole = "customer" | "driver";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type LorryStatus = "available" | "busy" | "inactive";

export type PickupStatus =
  | "open"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type DriverLoadAdStatus = "active" | "closed";

export type Profile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DriverProfile = {
  id: string;
  userId: string;
  drivingLicenseNo: string | null;
  address: string | null;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
};

export type Lorry = {
  id: string;
  driverId: string;
  registrationNumber: string;
  vehicleName: string | null;
  vehicleType: string;
  capacityKg: number;
  lengthFt: number | null;
  widthFt: number | null;
  vehiclePhotoUrl: string | null;
  status: LorryStatus;
  createdAt: string;
  updatedAt: string;
};

export type PickupOrder = {
  id: string;
  customerId: string;
  pickupPincode: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropPincode: string;
  dropAddress: string;
  dropLatitude: number | null;
  dropLongitude: number | null;
  parcelName: string;
  parcelDetails: string | null;
  weightKg: number;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  budget: number;
  status: PickupStatus;
  assignedDriverId: string | null;
  assignedLorryId: string | null;
  createdAt: string;
  updatedAt: string;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  inTransitAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
};

export type DriverLocation = {
  id: string;
  orderId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recordedAt: string;
  updatedAt: string;
};

export type DriverLoadAd = {
  id: string;
  driverId: string;
  lorryId: string | null;
  fromPincode: string;
  fromAddress: string;
  toPincode: string;
  toAddress: string;
  availableDate: string;
  capacityKg: number;
  expectedRate: number | null;
  notes: string | null;
  status: DriverLoadAdStatus;
  createdAt: string;
  updatedAt: string;
};
