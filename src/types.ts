export type Customer = {
  plan_type: any;
  id: number;
  name: string;    
  lastname?: string;   
  minutes_remaining: number;
};

export type Transaction = {
  id: number;
  customer_id: number;
  change: number;
  timestamp: string;
};