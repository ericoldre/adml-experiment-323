function evaluate(target, config, context) {
  var sql = target.sql || '';
  if (sql.indexOf(config.word) === -1) {
    return [{
      key: 'missing-word',
      classification: 'sql-content',
      message: "SQL statement does not contain required word '" + config.word + "'."
    }];
  }
  return [];
}
