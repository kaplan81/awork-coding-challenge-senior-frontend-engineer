export const enum GroupingCriterion {
  alphabetical,
  age,
  nationality,
  gender,
}

export type GroupingCriterionET = keyof typeof GroupingCriterion;
