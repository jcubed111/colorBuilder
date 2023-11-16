import PropTypes from 'prop-types';
import cn from 'classnames';
import {useRef} from 'react';

import styles from './Slider.module.scss';
import {ChangeOnBlurInput} from './ChangeOnBlurInput';
import {useDrag, useWheel} from '../hooks';


/**
Slider supports the following interaction methods:
- Wheel moves value up and down
- Input box takes typed values
- Input box changes on key events for arrow up and arrow down
- Arrows next to input can be clicked
- You can drag the slider
- You can click on the slider area to jump to a value
*/
export function Slider({
    min = 0,
    max = 255,
    value = 0,
    onChange = n => n,
    forceHeight = null,
    background = 'linear-gradient(to top, #000, #f00)',
    preciseInputStyle = 'input',
    name=null,
}) {
    const clamp = n => Math.max(min, Math.min(max, n));
    function applyDelta(d) {
        const base = d < 0 ? Math.ceil(value) : Math.floor(value);
        onChange(clamp(base + d));
    }
    function applyWheel(e) {
        e.preventDefault();
        if(navigator.appVersion.indexOf("Mac") != -1) {
            // This checks if the event came from a mouse scroll wheel
            // instead of a trackpad. Idk if this works on all systems
            // or just mine :shrug:
            if(event.wheelDelta % 120 == 0) {
                applyDelta(-Math.sign(event.wheelDelta));
            }else{
                applyDelta(event.deltaY);
            }
        }else{
            applyDelta(-Math.sign(event.deltaY));
        }
    }

    const topEl = useRef(null);
    useWheel(topEl, applyWheel);

    const sliderDragArea = useRef(null);
    useDrag(sliderDragArea, {
        dragCursor: 'row-resize',
        onMove(e) {
            applyDelta(-e.movementY);
        },
        onClick(e) {
            const rect = sliderDragArea.current.firstElementChild.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const h = rect.height;
            onChange(clamp(Math.round(
                (1 - (y / h))
                * (max - min)
                + min
            )));
        }
    }, [value]);

    const defaultInnerHeight = `${(max - min) + 1}px`;
    const clampedValue = clamp(value);
    const markerBottom = `${100 * (clampedValue - min) / (max - min + 1)}%`;

    return (
        <div ref={topEl} className={styles.slider} data-name={name}>
            <div ref={sliderDragArea} className={styles.sliderOuter}>
                <div
                    className={styles.sliderInner}
                    style={{
                        height: forceHeight ?? defaultInnerHeight,
                        background: background,
                    }}
                >
                    <div
                        className={styles.sliderMarker}
                        style={{bottom: markerBottom}}
                    />
                </div>
            </div>
            {preciseInputStyle == 'input' && (
                <InputWithArrows {...{value, clamp, onChange, applyDelta}}/>
            )}
            {preciseInputStyle == 'arrows' && (
                <Arrows applyDelta={applyDelta} />
            )}
        </div>
    );
}

Slider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    value: PropTypes.number,
    preciseInputStyle: PropTypes.oneOf(['input', 'arrows', 'none']),
};

function InputWithArrows({value, clamp, onChange, applyDelta}) {
    return (
        <div className={styles.numberWrapper}>
            <ChangeOnBlurInput
                className={styles.numberBox}
                value={value}
                onInput={e => {
                    const asInt = +e.target.value;
                    if(
                        !isNaN(asInt)
                        && isFinite(asInt)
                        && asInt != value
                    ) {
                        onChange(clamp(asInt));
                    }
                }}
                onKeyDown={e => {
                    let v = 0;
                    if(e.key == 'ArrowUp') {
                        v = 1;
                    }else if(e.key == 'ArrowDown') {
                        v = -1;
                    }else{
                        return undefined;
                    }
                    const newV = clamp(value + v);
                    onChange(newV);
                    return newV;
                }}
            />
            <Arrows isPartOfInput applyDelta={applyDelta} />
        </div>
    );
}

function Arrows({applyDelta, isPartOfInput=false}) {
    return (
        <div className={cn(styles.arrowWrapper, !isPartOfInput && styles.loneArrowWrapper)}>
            <div
                className={styles.arrowUp}
                onClick={() => applyDelta(1)}
            >&#9650;</div>
            <div
                className={styles.arrowDown}
                onClick={() => applyDelta(-1)}
            >&#9660;</div>
        </div>
    );
}
