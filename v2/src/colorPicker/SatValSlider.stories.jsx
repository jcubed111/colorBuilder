import { SatValSlider } from './SatValSlider';
import { Color } from '../Color';
import {globalDecorator} from '../globalStyles';
import {useState} from 'react';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'SatValSlider',
    component: SatValSlider,
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
    const [color, setColor] = useState(new Color('#3af'));
    return <SatValSlider {...args} color={color} setComponent={args => {
        setColor(color.set(args));
    }}/>;
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {

};
