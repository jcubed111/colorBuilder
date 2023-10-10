import { Color } from './Color';


function ColorPreview({value}) {
    try{
        const c = new Color(value);
        console.log(c, c.toString());
        return <div style={{
            width: '250px',
            height: '250px',
            background: `
                linear-gradient(${c.hex} 0% 100%),
                repeating-conic-gradient(#999 0% 25%, #666 0% 50%) top left / 16px 16px
            `,
            borderRadius: '10%',
        }}/>;
    }catch(e) {
        console.error(e);
        return <div style={{
            color: '#f00',
            width: '250px',
            height: '250px',
        }}>Can't parse {value}</div>;
    }
}
// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
    title: 'Color',
    component: ColorPreview,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
    argTypes: {
        'value': {control: 'text'},
    },
};

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary = {
    args: {value: '#3af'},
};
