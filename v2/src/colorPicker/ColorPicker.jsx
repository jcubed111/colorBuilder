import {useState} from 'react';

import styles from './ColorPicker.module.scss';
import globalVars from '../globals.module.scss';
import {Slider} from './Slider';
import {SatValSlider} from './SatValSlider';
import {ColorInput} from './ColorInput';
import {Color} from '../Color';


export function ColorPicker({
    defaultValue = '#39e',
    onChange = _ => _,
}) {
    const [value, setValue] = useState(new Color(defaultValue));

    function setComponent(args) {
        const c = value.set(args);
        setValue(c);
        onChange(c);
    }

    function setColorFromString(raw) {
        try{
            const c = new Color(raw);
            setValue(c);
            onChange(c);
        }catch{
            // pass
        }
    }

    return (
        <div className={styles.sliderArea}>
            <ColorDisplay color={value}/>
            <RgbSlider prop='r' color={value} setComponent={setComponent} />
            <RgbSlider prop='g' color={value} setComponent={setComponent} />
            <RgbSlider prop='b' color={value} setComponent={setComponent} />
            <HueSlider color={value} setComponent={setComponent} />
            <SatSlider color={value} setComponent={setComponent} />
            <ValSlider color={value} setComponent={setComponent} />
            <AlphaSlider color={value} setComponent={setComponent} />
            <SatValSlider color={value} setComponent={setComponent} />
            <div className={styles.mainInput}>
                <ColorInput name='' colorString={value.hex} setColor={setColorFromString}/>
                <ColorInput name='' colorString={value.rgbCommas} setColor={setColorFromString}/>
                <ColorInput name='' colorString={value.hsl} setColor={setColorFromString}/>
            </div>
        </div>
    );
}

function ColorDisplay({color}) {
    return (
        <div className={styles.colorDisplay}>
            <div className={styles.inner}>
                <div className={styles.alpha} style={{background: color}}></div>
                <div className={styles.solid} style={{background: color.set({a: 255})}}></div>
            </div>
        </div>
    );
}

function RgbSlider({prop, color, setComponent}) {
    return (
        <Slider
            min={0}
            max={255}
            value={color[prop]}
            onChange={n => setComponent({[prop]: n})}
            background={`
                linear-gradient(to top,
                    ${color.set({[prop]: 0, a: 255})},
                    ${color.set({[prop]: 255, a: 255})}
                )
            `}
            name={{r: 'Red', g: 'Green', b: 'Blue'}[prop]}
        />
    );
}

function HueSlider({color, setComponent}) {
    return (
        <Slider
            min={0}
            max={360}
            value={color.h}
            onChange={n => setComponent({h: n})}
            background={`
                linear-gradient(to top,
                    ${color.set({h: 0, a: 255})}   0.00000%,
                    ${color.set({h: 60, a: 255})}  16.66667%,
                    ${color.set({h: 120, a: 255})} 33.33333%,
                    ${color.set({h: 180, a: 255})} 50.00000%,
                    ${color.set({h: 240, a: 255})} 66.66667%,
                    ${color.set({h: 300, a: 255})} 83.33333%,
                    ${color.set({h: 360, a: 255})} 100.00000%
                )
            `}
            name='Hue'
        />
    );
}

function SatSlider({color, setComponent}) {
    return (
        <Slider
            min={0}
            max={100}
            value={color.s}
            onChange={n => setComponent({s: n})}
            background={`
                linear-gradient(to top,
                    ${color.set({s: 0, a: 255})},
                    ${color.set({s: 100, a: 255})}
                )
            `}
            name='Sat'
        />
    );
}

function ValSlider({color, setComponent}) {
    return (
        <Slider
            min={0}
            max={100}
            value={color.v}
            onChange={n => setComponent({v: n})}
            background={`
                linear-gradient(to top,
                    ${color.set({v: 0, a: 255})},
                    ${color.set({v: 100, a: 255})}
                )
            `}
            name='Val'
        />
    );
}

function AlphaSlider({color, setComponent}) {
    return (
        <Slider
            min={0}
            max={255}
            value={color.a}
            onChange={n => setComponent({a: n})}
            background={`
                linear-gradient(to top,
                    ${color.set({a: 0})},
                    ${color.set({a: 255})}
                ),
                ${globalVars.checkers}
            `}
            name='Alpha'
        />
    );
}

