import {useEffect, useRef} from 'react';


const returnTrue = () => true;
export function useDrag(
    dragElRef,
    {
        dragCursor=null,  // null means we'll never change the cursor
        onStartDrag=returnTrue,
        onMove=returnTrue,
        onEndDrag=returnTrue,
        // onClick is called *instead of* onDragEnd if:
        // - the mouse moved < 2px, and duration < 400ms
        // - AND onClick is not null.
        // onStartDrag is always called, onMove is maybe called.
        onClick=null,
    },
    dependencies=[],
) {
    const dragging = useRef(false);
    const dragStartState = useRef([]);
    useEffect(() => {
        if(!dragElRef.current) return;
        const el = dragElRef.current;
        function setCursor() {
            if(dragCursor) {
                el.style.cursor = dragging.current ? dragCursor : '';
            }
        }
        function removeWindowListeners() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        function onMouseMove(e) {
            if(!dragging.current) return;
            onMove(e);
        }
        function onMouseUp(e) {
            if(!dragging.current) return;
            dragging.current = false;
            setCursor();
            removeWindowListeners();

            // Check if this is actually a click
            const [startX, startY, startT] = dragStartState.current;
            if(
                onClick
                && (startX - e.clientX) ** 2 + (startY - e.clientY) ** 2 < 4
                && performance.now() - startT < 400
            ) {
                onClick(e);
            }else{
                onEndDrag(e);
            }
        }
        function onMouseDown(e) {
            if(dragging.current) return;
            if(e.button != 0) return;
            const beginDrag = onStartDrag(e);
            if(beginDrag === false) {
                return;
            }
            dragging.current = true;
            dragStartState.current = [
                e.clientX,
                e.clientY,
                performance.now(),
            ];
            setCursor();
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }

        el.addEventListener('mousedown', onMouseDown);
        setCursor();
        if(dragging.current) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }

        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            removeWindowListeners();
        };

    }, [dragElRef.current, ...dependencies]);
}

export function useWheel(elRef, onWheel, dependencies=[]) {
    // The default way react attaches handlers prevents the use
    // of .preventDefault, so we attach the wheel handler ourselves.
    useEffect(() => {
        if(!elRef.current) return;
        const node = elRef.current;
        node.addEventListener('wheel', onWheel);
        return () => {
            node.removeEventListener('wheel', onWheel);
        };
    }, [elRef.current, onWheel, ...dependencies]);
}
