const assignRider = (order, riders) => {
  if (!riders?.length) return null;
  return riders[0];
};

const nextStatus = (current) => {
  const flow = ['pending', 'confirmed', 'preparing', 'ready', 'picked-up', 'on-the-way', 'delivered'];
  const idx = flow.indexOf(current);
  if (idx === -1 || idx === flow.length - 1) return current;
  return flow[idx + 1];
};

export { assignRider, nextStatus };
