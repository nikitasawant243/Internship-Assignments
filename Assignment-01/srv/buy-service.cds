using my.bookshop as my from '../db/schema';

service BuyService {
  entity Orders as projection on my.Orders;
}
