/**
 * Maps CSV header names to snake_case property names used in records.
 */

export const FEDERAL_SALES_FIELD_MAP = {
  'Calendar Year': 'calendar_year',
  'Land Class': 'land_class',
  'Land Category': 'land_category',
  'State/Offshore Region': 'state_offshore_region',
  'Revenue Type': 'revenue_type',
  'Commodity': 'commodity',
  'Sales Volume': 'sales_volume',
  'Gas MMBtu Volume': 'gas_volume',
  'Sales Value': 'sales_value',
  'Royalty Value Prior to Allow': 'royalty_value_prior_to_allowance',
  'Transportation Allow': 'transportation_allowance',
  'Processing Allow': 'processing_allowance',
  'Royalty Value Less Allow': 'royalty_value_less_allowance',
  'Effective Royalty Rate': 'effective_royalty_rate',
};
