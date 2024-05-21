const ids = [
  'N191088', 'N200004', 'N200016', 'N200053', 'N200072', 'N200074', 'N200077',
  'N200084', 'N200086', 'N200096', 'N200106', 'N200107', 'N200145', 'N200148',
  'N200161', 'N200166', 'N200168', 'N200186', 'N200232', 'N200247', 'N200305',
  'N200307', 'N200329', 'N200334', 'N200351', 'N200368', 'N200388', 'N200394',
  'N200426', 'N200427', 'N200447', 'N200478', 'N200509', 'N200518', 'N200545',
  'N200546', 'N200561', 'N200584', 'N200588', 'N200666', 'N200677', 'N200723',
  'N200738', 'N200750', 'N200784', 'N200808', 'N200871', 'N200878', 'N200891',
  'N200899', 'N200944', 'N201001', 'N201002', 'N201023', 'N201051', 'N201054',
  'N201076', 'N201100', 'N201108', 'N200414'
];

const emails = ids.map(id => id.replace('N', 'n') + '@rguktn.ac.in');

module.exports = emails;