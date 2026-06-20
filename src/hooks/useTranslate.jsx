import {  useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

export const useTranslate = () => {
    const intl = useIntl();

    const translate = (id) => {
       return intl.formatMessage({ id });
    }

    const locale = useSelector((state) => state.config.locale);
    const currentLanguage = locale.split('-')[0] || 'es';

    return {
        t: translate,
        currentLanguage
    }
}
