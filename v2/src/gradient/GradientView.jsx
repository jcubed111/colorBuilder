import {useState} from 'react';
import {PlusCircleFill, DashCircleFill, PencilFill, Stack} from 'react-bootstrap-icons';
import cn from 'classnames';

import styles from './GradientView.module.scss';
import globalVars from '../globals.module.scss';
import {Color} from '../Color';


export function GradientView({
    grad,
    selected,
    setSelected,
    addBefore,  // : (i, n) => ()  // Add n swatches before color i
    remove,  // : (i) => ()  // Remove swatch i
    duplicate,  // : (i) => ()  // Duplicate swatch i
}) {
    return <div className={styles.gradientView}>
        {grad.map((color, i) => (
            <Swatch
                color={color}
                active={i == selected}
                setSelected={() => setSelected(i)}
                key={i}
            >
                <AddButton
                    cb={n => addBefore(i, n)}
                    className={styles.before}
                    showMulti={i != 0}
                />
                <Button cb={_ => duplicate(i)} className={styles.duplicateButton}>
                    <PlusCircleFill/>
                </Button>
                <Button cb={_ => remove(i)} className={styles.removeButton}>
                    <DashCircleFill/>
                </Button>
                {i == grad.length - 1 && (
                    <AddButton
                        cb={n => addBefore(i + 1, n)}
                        showMulti={false}
                        className={styles.after}
                    />
                )}
            </Swatch>
        ))}
    </div>
}

function Swatch({
    color,
    children,
    active,
    setSelected,
}) {
    return (
        <div
            className={styles.swatch}
            style={{background: `
                linear-gradient(to top, ${color}, ${color}),
                ${globalVars.checkers}
            `}}
        >
            {active && (
                <div
                    className={styles.activeIndicator}
                    style={{color: color.getTextColor()}}
                >
                    <PencilFill/>
                </div>
            )}
            <div style={{position: 'absolute', inset: '0 0 0 0'}} onClick={setSelected} />
            {children}
        </div>
    );
}

function Button({cb, className, children}) {
    return (
        <div
            onClick={cb}
            className={cn(className, styles.button)}
        >
            {children}
        </div>
    );
}

const range = (a, b) => Array(b - a).fill(0).map((_, i) => i + a);

function AddButton({cb, className, showMulti=false}) {
    return <div className={cn(className, styles.button, styles.addButton)}>
        {
            showMulti
            ? range(1, 16).reduceRight((children, i) => (
                <div className={styles.addValueBlock}>
                    <div className={styles.inner} onClick={_ => cb(i)}>
                        {i == 1 ? <Stack/> : `+${i}`}
                    </div>
                    {children}
                </div>
            ), null)
            : (
                <div className={styles.addValueBlock}>
                    <div className={styles.inner} onClick={_ => cb(1)}>
                        <Stack/>
                    </div>
                </div>
            )
        }
    </div>;
}
