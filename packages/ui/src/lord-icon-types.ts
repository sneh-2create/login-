import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'lord-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
                src?: string;
                trigger?: string;
                colors?: string;
                stroke?: string | number;
                target?: string;
                state?: string;
            }, HTMLElement>;
        }
    }
}
