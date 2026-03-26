import { boot } from 'quasar/wrappers';
import { QImg } from 'quasar';

export default boot(() => {
    const props = QImg.props as unknown as Record<string, { type: unknown; default: unknown }>;
    props.noSpinner = { type: Boolean, default: true };
    props.noTransition = { type: Boolean, default: false };
});
