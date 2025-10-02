declare module "sslcommerz-lts" {
  interface SSLCommerzOptions {
    store_id: string;
    store_passwd: string;
    is_live: boolean;
  }

  interface InitOptions {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    emi_option?: number;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_country: string;
    cus_phone: string;
    product_name: string;
    product_category: string;
    product_profile: string;
    [key: string]: any; // fallback for extra props
  }

  class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: InitOptions): Promise<any>;
  }

  export = SSLCommerzPayment;
}
