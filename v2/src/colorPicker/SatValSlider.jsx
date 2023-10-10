import {useRef} from 'react';

import styles from './SatValSlider.module.scss';
import {useDrag, useWheel} from '../hooks';


/**
SatValSlider supports the following interaction methods:
- Wheel moves value
- You can drag the slider
- You can click on the slider area to jump to a value
*/
export function SatValSlider({
    color,
    setComponent = n => n,
}) {
    const clamp = n => Math.max(0, Math.min(100, n));

    function applyWheel(e) {
        e.preventDefault();
        let dx, dy;
        if(event.wheelDelta % 120 == 0) {
            // This checks if the event came from a mouse scroll wheel
            // instead of a trackpad. Idk if this works on all systems
            // or just mine :shrug:
            [dx, dy] = [Math.sign(e.deltaX), Math.sign(e.deltaY)];
        }else if(e.deltaMode == WheelEvent.DOM_DELTA_LINE || e.deltaMode == WheelEvent.DOM_DELTA_PAGE) {
            [dx, dy] = [Math.sign(e.deltaX), Math.sign(e.deltaY)];
        }else{
            [dx, dy] = [e.deltaX / 10, e.deltaY / 10];
        }
        setComponent({
            s: clamp(color.s - dx),
            v: clamp(color.v + dy),
        });
    }

    const topEl = useRef(null);
    useWheel(topEl, applyWheel);

    useDrag(topEl, {
        dragCursor: 'move',
        onMove(e) {
            const {width, height} = topEl.current.firstElementChild.getBoundingClientRect();
            setComponent({
                s: clamp(color.s + e.movementX / width * 100),
                v: clamp(color.v - e.movementY / height * 100),
            });
        },
        onClick(e) {
            const {top, left, width, height} = topEl.current.firstElementChild.getBoundingClientRect();
            const x = e.clientX - left;
            const y = e.clientY - top;

            setComponent({
                s: clamp(x / width * 100),
                v: clamp((1 - y / height) * 100),
            });
        }
    }, [setComponent]);

    const markerLeft = `${clamp(color.s)}%`;
    const markerBottom = `${clamp(color.v)}%`;

    return (
        <div ref={topEl} className={styles.satValSlider} data-name='SatVal'>
            <div
                className={styles.sliderInner}
                style={{
                    backgroundColor: color.set({s: 100, v: 100, a: 255}),
                }}
            >
                <div
                    className={styles.sliderMarker}
                    style={{
                        left: markerLeft,
                        bottom: markerBottom,
                        borderColor: color.getTextColor(),
                    }}
                />
            </div>
        </div>
    );
}

SatValSlider.propTypes = {
};
