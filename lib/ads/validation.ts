export type CreateDriverLoadAdFormValues = {
  lorryId: string;
  fromPincode: string;
  fromAddress: string;
  toPincode: string;
  toAddress: string;
  availableDate: string;
  capacityKg: string;
  expectedRate: string;
  notes: string;
};

export type CreateDriverLoadAdPayload = {
  lorry_id: string | null;
  from_pincode: string;
  from_address: string;
  to_pincode: string;
  to_address: string;
  available_date: string;
  capacity_kg: number;
  expected_rate: number | null;
  notes: string | null;
  status: "active";
};

export type DriverLoadAdValidationResult =
  | { ok: true; payload: CreateDriverLoadAdPayload }
  | { ok: false; message: string };

const pinCodePattern = /^[1-9][0-9]{5}$/;

export function validateCreateDriverLoadAdForm(
  values: CreateDriverLoadAdFormValues,
): DriverLoadAdValidationResult {
  const fromPincode = values.fromPincode.trim();
  const fromAddress = values.fromAddress.trim();
  const toPincode = values.toPincode.trim();
  const toAddress = values.toAddress.trim();
  const availableDate = values.availableDate.trim();
  const capacityKg = Number(values.capacityKg.trim());
  const expectedRateValue = values.expectedRate.trim();
  const expectedRate = expectedRateValue ? Number(expectedRateValue) : null;
  const notes = values.notes.trim();

  if (!pinCodePattern.test(fromPincode)) {
    return { ok: false, message: "Enter a valid 6-digit from PIN code." };
  }

  if (fromAddress.length < 10) {
    return { ok: false, message: "Enter the complete from address." };
  }

  if (!pinCodePattern.test(toPincode)) {
    return { ok: false, message: "Enter a valid 6-digit to PIN code." };
  }

  if (toAddress.length < 10) {
    return { ok: false, message: "Enter the complete to address." };
  }

  if (!availableDate) {
    return { ok: false, message: "Choose the available date." };
  }

  if (!Number.isFinite(capacityKg) || capacityKg <= 0) {
    return { ok: false, message: "Enter a valid available capacity in tons." };
  }

  if (expectedRate !== null && (!Number.isFinite(expectedRate) || expectedRate < 0)) {
    return { ok: false, message: "Enter a valid expected rate." };
  }

  return {
    ok: true,
    payload: {
      lorry_id: values.lorryId || null,
      from_pincode: fromPincode,
      from_address: fromAddress,
      to_pincode: toPincode,
      to_address: toAddress,
      available_date: availableDate,
      capacity_kg: capacityKg,
      expected_rate: expectedRate,
      notes: notes || null,
      status: "active",
    },
  };
}
