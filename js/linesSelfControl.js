(function () {
    const image_wrapper = document.getElementById('image-wrapper');
    const delete_line = document.getElementById('delete-line');
    const vertex = {
        x: null,
        y: null
    };
    let vertex_tuple = [];
    let allow_line_creation = true;
    let line_weight = 2;
    let target_line;
    let target_measure;
    let mouse_pressed;

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
        if (e.target.id === 'image-wrapper') {
            if (allow_line_creation) {
                const line = document.createElement('div');
                const measure = document.createElement('span');
                const buttonLeft = document.createElement('button');
                const buttonRight = document.createElement('button');

                includeVertex(e);
                if (vertex_tuple.length === 1) {
                    line.appendChild(buttonLeft);
                    line.appendChild(buttonRight);
                    line.appendChild(measure);
                    image_wrapper.appendChild(line);
                    target_line = line;
                    target_measure = measure;
                }
                // deep copy, not attach to memory
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
        if (target_line && mouse_pressed) {
            target_line.style.left = `${e.clientX - target_line.style.width.split('px')[0] / 2 + window.scrollX}px`;
            target_line.style.top = `${e.clientY - target_line.style.height.split('px')[0] / 2 + window.scrollY}px`;
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
        if(e.target.classList.contains('line')) {
            target_line = e.target;
            mouse_pressed = true;
        } else if(e.target.tagName === 'SPAN') {
            target_line = e.target.parentElement;
            mouse_pressed = true;
        }
    }

    function deleteLine() {
        if(target_line) {
            target_line.remove();
            target_line = null;
        }
    }

    function setOrientation() {
        const l = target_line.style;
        const isWidthBigger = Math.abs(px(l.width )- px(l.left)) < Math.abs(px(l.height) - px(l.top));
        target_line.setAttribute('biggerwidth', isWidthBigger);
    }

    M.subscribe('move-line', moveLine);
    M.subscribe('set-line', clickWrapper);
    M.subscribe('set-line', setOrientation);
    M.subscribe('delete-line', deleteLine);
    M.subscribe('preview-line', previewLine);
    M.subscribe('prepare-move-line', prepareMoveLine);

    // toggleLinesCreator();
    window.addEventListener('scroll', saveScrollPosition);
    image_wrapper.addEventListener('click', M.publish('set-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('preview-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('move-line').topic);
    image_wrapper.addEventListener('mousedown', M.publish('prepare-move-line').topic);
    image_wrapper.addEventListener('mouseup', () => mouse_pressed = false);
    delete_line.addEventListener('click', M.publish('delete-line').topic);
})();