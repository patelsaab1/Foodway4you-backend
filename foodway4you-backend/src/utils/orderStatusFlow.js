export const STATUS_FLOW = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['picked_up'],
  picked_up: ['on_the_way'],
  on_the_way: ['delivered'],
  delivered: [],
  cancelled: []
};