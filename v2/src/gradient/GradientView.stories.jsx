import { GradientView } from './GradientView';
import { Color } from '../Color';
import { globalDecorator } from '../globalStyles';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'GradientView',
    component: GradientView,
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
    return <div style={{height: '500px', display: 'flex'}}>
        <GradientView {...args}/>
    </div>;
}

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {
        grad: [
            new Color('#471'),
            new Color('#175'),
            new Color('#1578'),
        ],
        selected: 1,
        setSelected: (...args) => console.log('setSelected', ...args),
        addBefore: (...args) => console.log('addBefore', ...args),
        remove: (...args) => console.log('remove', ...args),
        duplicate: (...args) => console.log('duplicate', ...args),
    },
};
