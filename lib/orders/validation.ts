export type PickupLocation = {
  latitude: number;
  longitude: number;
};

export type CreatePickupFormValues = {
  pickupPincode: string;
  pickupAddress: string;
  pickupLocation: PickupLocation | null;
  dropPincode: string;
  dropAddress: string;
  parcelName: string;
  parcelDetails: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  budget: string;
};

export type CreatePickupPayload = {
  pickup_pincode: string;
  pickup_address: string;
  pickup_latitude: number;
  pickup_longitude: number;
  drop_pincode: string;
  drop_address: string;
  parcel_name: string;
  parcel_details: string | null;
  weight_kg: number;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  budget: number;
};

export type PickupValidationResult =
  | { ok: true; payload: CreatePickupPayload }
  | { ok: false; message: string };

const pinCodePattern = /^[1-9][0-9]{5}$/;

function toOptionalPositiveNumber(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return { ok: true as const, value: null };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { ok: false as const, message: `${label} must be greater than 0.` };
  }

  return { ok: true as const, value: parsed };
}

export function validateCreatePickupForm(values: CreatePickupFormValues): PickupValidationResult {
  const pickupPincode = values.pickupPincode.trim();
  const dropPincode = values.dropPincode.trim();
  const pickupAddress = values.pickupAddress.trim();
  const dropAddress = values.dropAddress.trim();
  const parcelName = values.parcelName.trim();
  const parcelDetails = values.parcelDetails.trim();
  const weightKg = Number(values.weightKg.trim());
  const budget = Number(values.budget.trim());

  if (!pinCodePattern.test(pickupPincode)) {
    return { ok: false, message: "Enter a valid 6-digit pickup PIN code." };
  }

  if (pickupAddress.length < 10) {
    return { ok: false, message: "Enter the complete pickup address." };
  }

  if (!values.pickupLocation) {
    return {
      ok: false,
      message: "Please add your exact pickup location before creating the pickup.",
    };
  }

  if (!pinCodePattern.test(dropPincode)) {
    return { ok: false, message: "Enter a valid 6-digit drop PIN code." };
  }

  if (dropAddress.length < 10) {
    return { ok: false, message: "Enter the complete drop address." };
  }

  if (!parcelName) {
    return { ok: false, message: "Enter the parcel or item name." };
  }

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { ok: false, message: "Enter a valid weight greater than 0 ton." };
  }

  const length = toOptionalPositiveNumber(values.lengthCm, "Length");
  if (!length.ok) {
    return { ok: false, message: length.message };
  }

  const width = toOptionalPositiveNumber(values.widthCm, "Width");
  if (!width.ok) {
    return { ok: false, message: width.message };
  }

  const height = toOptionalPositiveNumber(values.heightCm, "Height");
  if (!height.ok) {
    return { ok: false, message: height.message };
  }

  if (!Number.isFinite(budget) || budget < 0) {
    return { ok: false, message: "Enter a valid budget." };
  }

  return {
    ok: true,
    payload: {
      pickup_pincode: pickupPincode,
      pickup_address: pickupAddress,
      pickup_latitude: values.pickupLocation.latitude,
      pickup_longitude: values.pickupLocation.longitude,
      drop_pincode: dropPincode,
      drop_address: dropAddress,
      parcel_name: parcelName,
      parcel_details: parcelDetails || null,
      weight_kg: weightKg,
      length_cm: length.value,
      width_cm: width.value,
      height_cm: height.value,
      budget,
    },
  };
}

