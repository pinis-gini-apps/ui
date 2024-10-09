console.log('simple test')
console.log(process.env.TEST_TAG)

const { execSync } = require('child_process')

const testTag = process.env.TEST_TAG
const cucumberCommand = `./node_modules/.bin/cucumber-js --require-module @babel/register --require-module @babel/polyfill -f json:tests/reports/cucumber_report.json -f html:tests/reports/cucumber_report_default.html tests -t '${testTag}'`

try {
  execSync(cucumberCommand, { stdio: 'inherit' })
} catch (err) {
  console.log(err.message)
}
