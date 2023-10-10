import { Inconsolata } from 'next/font/google';
import g from './globals.module.scss';
const inconsolata = Inconsolata({ subsets: ['latin'] })


export const globalClassName = inconsolata.className + ' ' + g.global;
export function globalDecorator(C) {
    return <div className={globalClassName}><C/></div>
}
