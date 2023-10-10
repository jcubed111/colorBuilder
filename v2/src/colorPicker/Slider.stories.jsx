import { Slider } from './Slider';
import {globalDecorator} from '../globalStyles';
import {useState} from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Slider',
    component: Slider,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {},
    decorators: [
        (S, {args}) => (<Wrapper {...args} />),
        globalDecorator,
    ],
};

function Wrapper(args) {
    const [v, setV] = useState(args.value);
    return <Slider {...args} value={v} onChange={n => {
        setV(n);
    }}/>;
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {
        min: 0,
        max: 255,
        value: 87,
    },
};
