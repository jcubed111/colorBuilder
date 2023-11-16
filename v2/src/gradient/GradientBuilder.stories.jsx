import { GradientBuilder } from './GradientBuilder';
import { Color } from '../Color';
import { globalDecorator } from '../globalStyles';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'GradientBuilder',
    component: GradientBuilder,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    decorators: [
        globalDecorator,
    ],
};


// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {
        style: {height: '500px'},
    },
};
