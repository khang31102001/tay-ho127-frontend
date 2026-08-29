export { CustomersExplorer } from "./components/CustomersExplorer";
export { CustomerEditor } from "./components/CustomerEditor";
export { CustomerAddressesExplorer } from "./components/CustomerAddressesExplorer";
export { CustomerAddressEditor } from "./components/CustomerAddressEditor";
export { listCustomers, getCustomerById } from "./services/customer.service";
export { listAddressesByCustomerId } from "./services/customer-address.service";
export type { ManagedCustomer } from "./types/customer.types";
export type { ManagedCustomerAddress } from "./types/customer-address.types";
