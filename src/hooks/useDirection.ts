import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Direction = 'ltr' | 'rtl';

export const useDirection = (): Direction => {
  const { i18n } = useTranslation();
  const direction: Direction = i18n.language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
    
    // Add/remove RTL class for additional styling if needed
    if (direction === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [direction, i18n.language]);

  return direction;
};

export default useDirection;
