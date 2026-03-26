import { PiniaColada } from '@pinia/colada';
import { boot } from 'quasar/wrappers';

export default boot(({ app }) => {
    app.use(PiniaColada);
});
