import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { AgendadColors } from './colors';

export const AgendaPreset = definePreset(Aura, {
    semantic: {
        primary: AgendadColors.primary,
        focusRing: {
            width: '2px',
            style: 'solid',
            color: '{primary.color}',
            offset: '1px'
        }
    },
    global: {
        geometry: {
            borderRadius: '6px'
        }
    }
});
