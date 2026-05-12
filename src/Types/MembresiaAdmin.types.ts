/** Plan de membresía (lista admin GET). `intervalType` puede ser bool (API) o strings legacy. */
export interface MembershipPlanAdmin {
  id: number;
  name: string;
  price: number;
  intervalType: boolean | string;
  intervalCount: number;
  availableAll: boolean;
  accessFinished: boolean;
  isActive: boolean;
}

/** POST /api/v1/membresia/save_membership_plan — true = mes, false = año */
export interface SaveMembershipPlanPayload {
  name: string;
  price: number;
  intervalType: boolean;
  intervalCount: number;
  availableAll: boolean;
  accessFinished: boolean;
}

/** PUT /api/v1/membresia/update_membership_plan */
export interface UpdateMembershipPlanPayload {
  id: number;
  name: string;
  price: number;
  intervalCount: number;
  availableAll: boolean;
  accessFinished: boolean;
  isActive: boolean;
}
