module.exports = () => {
  return {
    path: 'settings/class.js',
    data: `\
import Syncano from 'syncano';
import SyncanoClassTemplate from 'syncano-cli/lib/utils/class';
import instanceSettings from './instance.json'


SyncanoClassTemplate.connection = new Syncano({
  apiKey: instanceSettings.api_key,
  instance: instanceSettings.name
});

export default SyncanoClassTemplate;
`}
};
