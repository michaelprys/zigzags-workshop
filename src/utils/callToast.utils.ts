import type { QNotifyCreateOptions } from 'quasar';
import { Notify } from 'quasar';

export const callToast = (
    message: string,
    isSuccess: boolean,
    position: QNotifyCreateOptions['position'] = 'bottom-right',
) => {
    Notify.create({
        timeout: 2000,
        message,
        color: isSuccess ? 'positive' : 'negative',
        textColor: isSuccess ? 'dark' : 'primary',
        position,
        progress: true,
        progressClass: 'progress',
    });
};
