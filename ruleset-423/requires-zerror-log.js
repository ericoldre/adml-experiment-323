function evaluate(target, config, context) {
  var updates = (target.subject && target.subject.updates) || [];
  var hasLog = updates.some(function(u) {
    return u.column === 'ZERROR_LOG';
  });
  if (!hasLog) {
    return [{
      key: 'missing-zerror-log',
      classification: 'missing-zerror-log-update',
      message: 'Report does not update ZERROR_LOG on subject rows. ' +
        'Add a subject.updates entry for ZERROR_LOG so findings are ' +
        'recorded on the affected rows.'
    }];
  }
  return [];
}
