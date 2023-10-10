import { ColorInput } from './ColorInput';
import { Color } from '../Color';
import {globalDecorator} from '../globalStyles';
import {useState} from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'ColorInput',
    component: ColorInput,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    decorators: [
        (S, {args}) => (<Wrapper {...args} />),
        globalDecorator,
    ],
};

function Wrapper(args) {
    const [color, setColor] = useState(args.value);
    return <ColorInput colorString={color.hex} setColor={raw => {
        try{
            const c = new Color(raw);
            setColor(c);
        }catch{
            // pass
        }
    }}/>;
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {
        value: new Color('#175'),
    },
};
