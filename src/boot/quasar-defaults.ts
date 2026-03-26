import { boot } from 'quasar/wrappers';
import { QImg } from 'quasar';

export default boot(() => {
    QImg.props.noSpinner = { type: Boolean, default: true };
    QImg.props.noTransition = { type: Boolean, default: false };
});
