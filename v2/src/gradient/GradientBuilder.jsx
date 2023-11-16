import {useState, useRef, useEffect} from 'react';

import styles from './GradientBuilder.module.scss';
import globalVars from '../globals.module.scss';
import {Color} from '../Color';
import {ColorPicker} from '../colorPicker/ColorPicker';

import {GradientView} from './GradientView';


export function GradientBuilder({
    style
}) {
    const [grad, setGrad] = useState(
        ['#162d2d', '#2c1e1e'].map(c => new Color(c))
    );
    const [selected, setSelected] = useState(0);
    const mainEl = useRef();

    // useEffect(() => {
    //     // to set the bg
    //     const useDithered = true;
    //     const visibleHeight =
    //         (mainEl.current?.offsetHeight ?? window.innerHeight)
    //         * window.devicePixelRatio;

    //     const background = [
    //         useDithered
    //             ? `url('${makeDitheredBg(visibleHeight, grad)}') top left / contain`
    //             : `linear-gradient(to bottom, ${grad.join(', ')})`,
    //         globalVars.checkers
    //     ].join(',');

    //     console.log(background);
    //     requestAnimationFrame(_ => mainEl.current.style.background = background);
    // }, [grad]);

    function remove(i) {
        if(grad.length == 1) return;
        setGrad(grad.filter((_, n) => i != n));
        if(selected == grad.length - 1) {
            setSelected(selected - 1);
        }
    }
    function duplicate(i) {
        console.log('duplicate', i);
        setGrad([
            ...grad.slice(0, i),
            new Color(grad[i]),
            ...grad.slice(i),
        ]);
    }
    function addBefore(i, n=1) {
        if(i == 0) {
            duplicate(i);
        }else if(i == grad.length) {
            duplicate(i - 1);
        }else{
            console.log('add middle');
            const newColors = [];
            for(let j = 1; j <= n; j++) {
                newColors.push(grad[i - 1].lerp(grad[i], j / (n + 1)));
            }
            setGrad([
                ...grad.slice(0, i),
                ...newColors,
                ...grad.slice(i),
            ]);
        }
    }

    return (
        <div
            className={styles.gradientBuilder}
            ref={mainEl}
            style={{
                ...style,
                background: [
                    `linear-gradient(to bottom, ${grad.join(', ')})`,
                    globalVars.checkers
                ].join(',')
            }}
        >
            <div style={{flexGrow: 0.2}} />
            <GradientView
                grad={grad}
                selected={selected}
                setSelected={setSelected}
                addBefore={addBefore}
                remove={remove}
                duplicate={duplicate}
            />
            <div style={{flexGrow: 1.0}} />
            <ColorPicker
                defaultValue={grad[selected]}
                onChange={c => setGrad([
                    ...grad.slice(0, selected),
                    new Color(c),
                    ...grad.slice(selected + 1),
                ])}
                key={selected}
            />
        </div>
    );
}


function colorAtGradPos(grad, f) {
    const segments = grad.length - 1;
    if(f <= 0 || segments == 0) return grad[0];
    if(f >= 1) return grad[segments];
    const before = grad[Math.floor(f * segments)];
    const after = grad[Math.ceil(f * segments)];
    return before.lerp(after, (f * segments) % 1.0);
}

function makeDitheredBg(height, grad) {
    console.time('makeDitheredBg');
    const width = 8;

    // Make a pixel buffer
    const idealColorArr = Array(height).fill(0).flatMap((_, i) => {
        const {r, g, b, a} = colorAtGradPos(grad, i / (height - 1));
        return [r, g, b, a];
    });
    const px2Index = (y, x, c) => (y * width + x) * 4 + c;
    const residuals = new Array(width * (height + 1) * 4).fill(0);
    const outBuffer = new Uint8ClampedArray(width * height * 4);
    for(let y = 0; y < height; y++) {
        for(let x = 0; x < width; x++) {
            for(let c = 0; c < 4; c++) {
                // const targetValue =
                //     idealColorArr[y * 4 + c]
                //     + residuals[px2Index(y, x, c)];
                // const roundedValue = Math.round(targetValue);
                // const quantError = targetValue - roundedValue;

                // residuals[px2Index(y,     x + 1, c)] += quantError * 7 / 16;
                // residuals[px2Index(y + 1, x - 1, c)] += quantError * 3 / 16;
                // residuals[px2Index(y + 1, x,     c)] += quantError * 5 / 16;
                // residuals[px2Index(y + 1, x + 1, c)] += quantError * 1 / 16;

                // outBuffer[px2Index(y, x, c)] = roundedValue;
                outBuffer[px2Index(y, x, c)] = Math.round(idealColorArr[y * 4 + c]);
            }
        }
    }

    // Apply the buffer to a canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    imageData.data.set(outBuffer);
    ctx.putImageData(imageData, 0, 0);

    // Generate image url
    const result = canvas.toDataURL();
    console.timeEnd('makeDitheredBg');
    return result;
}
