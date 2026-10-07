import type {
  DriverLocation,
  DriverLoadAd,
  DriverLoadAdStatus,
  DriverProfile,
  Lorry,
  LorryStatus,
  PickupOrder,
  PickupStatus,
  Profile,
  UserRole,
  VerificationStatus,
} from "@/types/domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type DbProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type DbDriverProfile = {
  id: string;
  user_id: string;
  driving_license_no: string | null;
  address: string | null;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
};

type DbLorry = {
  id: string;
  driver_id: string;
  registration_number: string;
  vehicle_name: string | null;
  vehicle_type: string;
  capacity_kg: number;
  length_ft: number | null;
  width_ft: number | null;
  vehicle_photo_url: string | null;
  status: LorryStatus;
  created_at: string;
  updated_at: string;
};

type DbPickupOrder = {
  id: string;
  customer_id: string;
  pickup_pincode: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  drop_pincode: string;
  drop_address: string;
  drop_latitude: number | null;
  drop_longitude: number | null;
  parcel_name: string;
  parcel_details: string | null;
  weight_kg: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  budget: number;
  status: PickupStatus;
  assigned_driver_id: string | null;
  assigned_lorry_id: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  picked_up_at: string | null;
  in_transit_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

type DbDriverLocation = {
  id: string;
  order_id: string;
  driver_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recorded_at: string;
  updated_at: string;
};

type DbDriverLoadAd = {
  id: string;
  driver_id: string;
  lorry_id: string | null;
  from_pincode: string;
  from_address: string;
  to_pincode: string;
  to_address: string;
  available_date: string;
  capacity_kg: number;
  expected_rate: number | null;
  notes: string | null;
  status: DriverLoadAdStatus;
  created_at: string;
  updated_at: string;
};

type TableDefinition<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

type NoDirectInsert = Record<string, never>;
type NoDirectUpdate = Record<string, never>;

export type Database = {
  public: {
    Tables: {
      profiles: TableDefinition<
        DbProfile,
        NoDirectInsert,
        {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
        }
      >;
      driver_profiles: TableDefinition<
        DbDriverProfile,
        {
          user_id: string;
          driving_license_no?: string | null;
          address?: string | null;
        },
        {
          driving_license_no?: string | null;
          address?: string | null;
        }
      >;
      lorries: TableDefinition<
        DbLorry,
        {
          driver_id: string;
          registration_number: string;
          vehicle_name?: string | null;
          vehicle_type: string;
          capacity_kg: number;
          length_ft?: number | null;
          width_ft?: number | null;
          vehicle_photo_url?: string | null;
        },
        {
          registration_number?: string;
          vehicle_name?: string | null;
          vehicle_type?: string;
          capacity_kg?: number;
          length_ft?: number | null;
          width_ft?: number | null;
          vehicle_photo_url?: string | null;
        }
      >;
      pickup_orders: TableDefinition<
        DbPickupOrder,
        {
          customer_id: string;
          pickup_pincode: string;
          pickup_address: string;
          pickup_latitude: number;
          pickup_longitude: number;
          drop_pincode: string;
          drop_address: string;
          drop_latitude?: number | null;
          drop_longitude?: number | null;
          parcel_name: string;
          parcel_details?: string | null;
          weight_kg: number;
          length_cm?: number | null;
          width_cm?: number | null;
          height_cm?: number | null;
          budget: number;
        },
        NoDirectUpdate
      >;
      driver_locations: TableDefinition<
        DbDriverLocation,
        {
          order_id: string;
          driver_id: string;
          latitude: number;
          longitude: number;
          accuracy?: number | null;
          heading?: number | null;
          speed?: number | null;
          recorded_at?: string;
        },
        {
          latitude?: number;
          longitude?: number;
          accuracy?: number | null;
          heading?: number | null;
          speed?: number | null;
          recorded_at?: string;
        }
      >;
      driver_load_ads: TableDefinition<
        DbDriverLoadAd,
        {
          driver_id: string;
          lorry_id?: string | null;
          from_pincode: string;
          from_address: string;
          to_pincode: string;
          to_address: string;
          available_date: string;
          capacity_kg: number;
          expected_rate?: number | null;
          notes?: string | null;
          status?: DriverLoadAdStatus;
        },
        {
          lorry_id?: string | null;
          from_pincode?: string;
          from_address?: string;
          to_pincode?: string;
          to_address?: string;
          available_date?: string;
          capacity_kg?: number;
          expected_rate?: number | null;
          notes?: string | null;
          status?: DriverLoadAdStatus;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      set_initial_user_role: {
        Args: { p_role: UserRole };
        Returns: DbProfile;
      };
      accept_pickup_order: {
        Args: { p_order_id: string; p_lorry_id: string };
        Returns: DbPickupOrder;
      };
      mark_order_picked_up: {
        Args: { p_order_id: string };
        Returns: DbPickupOrder;
      };
      mark_order_in_transit: {
        Args: { p_order_id: string };
        Returns: DbPickupOrder;
      };
      mark_order_delivered: {
        Args: { p_order_id: string };
        Returns: DbPickupOrder;
      };
      cancel_pickup_order: {
        Args: { p_order_id: string };
        Returns: DbPickupOrder;
      };
      update_driver_location: {
        Args: {
          p_order_id: string;
          p_latitude: number;
          p_longitude: number;
          p_accuracy?: number | null;
          p_heading?: number | null;
          p_speed?: number | null;
          p_recorded_at?: string;
        };
        Returns: DbDriverLocation;
      };
    };
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      lorry_status: LorryStatus;
      pickup_status: PickupStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type {
  DriverLocation,
  DriverLoadAd,
  DriverLoadAdStatus,
  DriverProfile,
  Lorry,
  LorryStatus,
  PickupOrder,
  PickupStatus,
  Profile,
  UserRole,
  VerificationStatus,
};
