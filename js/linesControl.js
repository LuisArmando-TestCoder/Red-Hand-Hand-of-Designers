(function () {
    const image_wrapper = document.getElementById('image-wrapper');
    const eraser = document.querySelector('.eraser');
    const vertex = {
        x: null,
        y: null
    };
    let vertex_tuple = [];
    let allow_line_creation = true;
    let allow_line_resize = false;
    let line_weight = 2;
    let target_line;
    let target_style;
    let target_measure;
    let mouse_pressed;
    let side_pressed;
    let origin_w;
    // let isLineResizing = false;
    

    function saveScrollPosition() {
        localStorage.setItem('scrollY', window.scrollY);
        localStorage.setItem('scrollX', window.scrollX);
    }

    function includeVertex(e) {
        vertex.x = e.clientX;
        vertex.y = e.clientY;
        vertex_tuple.push(JSON.parse(JSON.stringify(vertex)));
    }

    function setLineMeasure(line, measure, tuple) {
        let click_valley = 1;
        let x = [tuple[0].x, tuple[1].x];
        let y = [tuple[0].y, tuple[1].y];
        if ((x[1] - x[0] > y[1] - y[0]) ^
            (x[0] - x[1] > y[1] - y[0])) {
            line.style.top = `${y[0] + window.scrollY + click_valley}px`;
            line.style.height = `${line_weight}px`;
            if (x[0] < x[1]) {
                line.style.left = `${x[0] + window.scrollX}px`;
                line.style.width = `${x[1] - x[0]}px`;
            } else if (x[1] < x[0]) {
                line.style.left = `${x[1] + window.scrollX}px`;
                line.style.width = `${x[0] - x[1]}px`;
            }
            measure.textContent = line.style.width;
        } else {
            line.style.left = `${x[0] + window.scrollX + click_valley}px`;
            line.style.width = `${line_weight}px`;
            if (y[0] < y[1]) {
                line.style.top = `${y[0] + window.scrollY}px`;
                line.style.height = `${y[1] - y[0]}px`;
            } else if (y[1] < y[0]) {
                line.style.top = `${y[1] + window.scrollY}px`;
                line.style.height = `${y[0] - y[1]}px`;
            }
            measure.textContent = line.style.height;
        }
    }

    function clickWrapper(e) {
        // let isLineResizing = false;
        // if (e.target.tagName === 'BUTTON') {
        //     e.target = e.target.parentElement.parentElement;
        //     isLineResizing = true;
        // }

        if (e.target.className === 'imgSegment' || isLineResizing) {
            if (allow_line_creation && !allow_line_resize) {
                const line = document.createElement('div');
                const measure = document.createElement('span');
                const buttonLeft = document.createElement('button');
                const buttonRight = document.createElement('button');

                includeVertex(e);

                if (vertex_tuple.length === 1) {
                    buttonLeft.setAttribute('side_pressed', '0');
                    buttonRight.setAttribute('side_pressed', '1');
                    line.appendChild(buttonLeft);
                    line.appendChild(buttonRight);
                    line.appendChild(measure);
                    e.target.appendChild(line);
                    setTargetLine(line);
                    target_measure = measure;
                }
                if (vertex_tuple.length === 2) {
                    line.classList.add('line');
                    setLineMeasure(line, measure, vertex_tuple);
                    vertex_tuple = [];
                }
            }
        }
    }

    function previewLine(e) {
        if (vertex_tuple.length) {
            target_line.classList.add('line');
            setLineMeasure(target_line, target_measure,
                vertex_tuple.concat({
                    x: e.clientX,
                    y: e.clientY
                }));
            positionLineMeasure(e);
        }
    }

    function moveLine(e) {
        if (target_line && mouse_pressed && !allow_line_resize) {
            target_line.style.left = `${e.clientX - 
                target_line.style.width.split('px')[0] / 2 + 
                window.scrollX}px`;

            target_line.style.top = `${e.clientY - 
                target_line.style.height.split('px')[0] / 2 + 
                window.scrollY}px`;
            positionLineMeasure(e);
        }
    }

    function positionLineMeasure(e) {
        const measure = target_line.querySelector('span');
        const is = {
            vertical: e.clientY < image_wrapper.clientHeight / 2 - window.scrollY,
            horizontal: e.clientX < image_wrapper.clientWidth / 2 - window.scrollX
        };
        measure.setAttribute('vertical', is.vertical);
        measure.setAttribute('horizontal', is.horizontal);
    }

    function prepareMoveLine(e) {
        const tag = e.target.tagName;
        e = e.target;
        if (e.classList.contains('line')) {
            setTargetLine(e);
            mouse_pressed = true;
        } else if (tag === 'SPAN') {
            setTargetLine(e.parentElement);
            mouse_pressed = true;
        }
    }

    function deleteLine(e) {
        if (target_line && target_line.classList.contains('line')) {
            const parent = target_line.parentElement;
            const children = parent.children.length;
            target_line.remove();
            setTargetLine(parent.children[children - 2]);
        }
    }

    function setOrientation() {
        const l = target_line.style;
        const isWidthBigger =
            Math.abs(px(l.width) - px(l.left)) + window.scrollX <
            Math.abs(px(l.height) - px(l.top)) + window.scrollY;
        target_line.setAttribute('biggerwidth', isWidthBigger ? 1 : 0);
        setMouseOrientation();
    }

    function setMouseOrientation() {
        const l = target_line.style;
        const mouseOrientation = px(l.width) < px(l.height);
        target_line.setAttribute('mouse_orientation', mouseOrientation ? 1 : 0);
    }

    function prepareResizeLine(e) {
        const tag = e.target.tagName;
        e = e.target;
        if (tag === 'BUTTON' && !allow_line_resize) {
            setTargetLine(e.parentElement);
            target_measure = target_line.querySelector('span');
            mouse_pressed = true;
            allow_line_resize = true;
            target_style = JSON.parse(JSON.stringify(target_line.style));
            side_pressed = e.getAttribute('side_pressed');
        } else allow_line_resize = false;
    }

    function getVertex() {
        return [
            [{
                    x: px(target_style.left) - window.scrollX,
                    y: px(target_style.top) - window.scrollY + px(target_style.height)
                },
                {
                    x: px(target_style.left) - window.scrollX + px(target_style.width),
                    y: px(target_style.top) - window.scrollY + px(target_style.height)
                }
            ],
            [{
                    x: px(target_style.left) - window.scrollX,
                    y: px(target_style.top) - window.scrollY
                },
                {
                    x: px(target_style.left) - window.scrollX,
                    y: px(target_style.top) - window.scrollY
                }
            ]
        ];
    }

    function resizeLine(e) { ///////////////////////////////
        if (allow_line_resize && mouse_pressed) {
            const isLeft = side_pressed;
            const biggerwidth = target_line.getAttribute('biggerwidth');
            const vertex = getVertex()[isLeft][biggerwidth];
            setLineMeasure(target_line, target_measure,
                [vertex, {
                    x: e.clientX,
                    y: e.clientY
                }]);
            positionLineMeasure(e);
            setMouseOrientation();
        }
    }

    function adjustCenter() {
        const all_lines = [...image_wrapper.getElementsByClassName('line')];
        const left = window.innerWidth - origin_w;
        setW();
        all_lines.forEach(line => {
            line.style.left = `${px(line.style.left) + left / 2}px`;
        });
    }

    function setW(w) {
        origin_w = w ? w : window.innerWidth;
    }

    function setTargetLine(target) {
        const all_lines = [...image_wrapper.querySelectorAll('[target_line]')];
        target_line = target;
        all_lines.forEach(line => line.removeAttribute('target_line'));
        target_line.setAttribute('target_line', '')
    }

    setW();

    M.subscribe('move-line', moveLine);
    M.subscribe('set-line', clickWrapper);
    M.subscribe('set-line', setOrientation);
    M.subscribe('delete-line', deleteLine);
    M.subscribe('preview-line', previewLine);
    M.subscribe('prepare-move-line', prepareMoveLine);
    M.subscribe('prepare-resize-line', prepareResizeLine);
    M.subscribe('resize-line', resizeLine);
    M.subscribe('window-resize', adjustCenter);

    window.addEventListener('scroll', saveScrollPosition);
    window.addEventListener('resize', M.publish('window-resize').topic);
    window.addEventListener('keydown', e => {
        if(e.key === 'Backspace') {
            M.publish('delete-line').topic(e);
        }
    });
    eraser.addEventListener('click', M.publish('delete-line').topic);

    image_wrapper.addEventListener('click', M.publish('set-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('preview-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('move-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('resize-line').topic);
    image_wrapper.addEventListener('mousedown', M.publish('prepare-move-line').topic);
    image_wrapper.addEventListener('mousedown', M.publish('prepare-resize-line').topic);
    image_wrapper.addEventListener('mouseup', () => mouse_pressed = false);
})();
