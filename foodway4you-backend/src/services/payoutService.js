const splitCommission = ({ total, commissionRate }) => {
  const commission = Math.round((total * commissionRate) / 100);
  const net = total - commission;
  return { commission, net };
};

export { splitCommission };
