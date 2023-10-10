import {Clipboard2Plus, Clipboard2CheckFill} from 'react-bootstrap-icons';
import {useRef} from 'react';
import cn from 'classnames';

import styles from './ColorInput.module.scss';
import {ChangeOnBlurInput} from './ChangeOnBlurInput';

export function ColorInput({
    colorString,
    setColor = () => {},
    name=null,
}) {
    const toastElRef = useRef();
    const inputRef = useRef();

    async function doCopy() {
        inputRef.current.select();
        document.execCommand("copy");

        toastElRef.current.classList.remove(styles.fade);
        await new Promise(resolve => setTimeout(resolve, 0));
        toastElRef.current.classList.add(styles.fade);
    }

    return (
        <div className={styles.controlGroup} data-name={name}>
            <ChangeOnBlurInput
                className={styles.numberBox}
                value={colorString}
                onInput={e => setColor(e.target.value)}
                inputRef={inputRef}
            />
            <div className={styles.copyButton} onClick={doCopy}>
                <Clipboard2Plus />
                <div ref={toastElRef} className={cn(
                    styles.buttonSuccessToast,
                    styles.fade
                )}>
                    <Clipboard2CheckFill />
                </div>
            </div>
        </div>
    );
}

ColorInput.propTypes = {};
