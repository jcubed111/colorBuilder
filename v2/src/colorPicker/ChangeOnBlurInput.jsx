import {useState, useRef} from 'react';


export function ChangeOnBlurInput({
    value,
    onInput,
    onBlur=_=>_,
    // onKeyDown behaves a little weird. If this function returns
    // a value other than `undefined`, we update the input to that
    // value. Otherwise we don't update the input text.
    onKeyDown=() => undefined,
    inputRef=null,
    ...args
}) {
    // An input box that acts uncontrolled when focused,
    // but controlled when not focused.
    let [v, setV] = useState(value.toString());
    const _defaultRef = useRef();
    const ref = inputRef ?? _defaultRef;
    if(
        ref.current
        && document.activeElement !== ref.current
        && v !== value.toString()
    ) {
        setV(value.toString());
    }

    return <input
        {...args}
        ref={ref}
        value={v}
        onInput={e => {
            setV(e.target.value);
            onInput(e);
        }}
        onBlur={() => {
            setV(value);
            onBlur();
        }}
        onKeyDown={e => {
            const forceUpdateTo = onKeyDown(e);
            if(forceUpdateTo){
                e.preventDefault();
                setV(forceUpdateTo.toString());
            }else if(e.key == 'Enter') {
                setV(value);
            }
        }}
    />
}
