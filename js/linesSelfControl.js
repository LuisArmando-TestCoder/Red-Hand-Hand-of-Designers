(function () {
    const image_wrapper = document.getElementById('image-wrapper');
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
        // close it in an if
        if ((tuple[1].x - tuple[0].x > tuple[1].y - tuple[0].y) ^
            (tuple[0].x - tuple[1].x > tuple[1].y - tuple[0].y)) {
            line.style.top = `${tuple[0].y + window.scrollY + click_valley}px`;
            line.style.height = `${line_weight}px`;
            if (tuple[0].x < tuple[1].x) {
                line.style.left = `${tuple[0].x + window.scrollX}px`;
                line.style.width = `${tuple[1].x - tuple[0].x}px`;
            } else if (tuple[1].x < tuple[0].x) {
                line.style.left = `${tuple[1].x + window.scrollX}px`;
                line.style.width = `${tuple[0].x - tuple[1].x}px`;
            }
            measure.textContent = line.style.width;
        } else {
            line.style.left = `${tuple[0].x + window.scrollX + click_valley}px`;
            line.style.width = `${line_weight}px`;
            if (tuple[0].y < tuple[1].y) {
                line.style.top = `${tuple[0].y + window.scrollY}px`;
                line.style.height = `${tuple[1].y - tuple[0].y}px`;
            } else if (tuple[1].y < tuple[0].y) {
                line.style.top = `${tuple[1].y + window.scrollY}px`;
                line.style.height = `${tuple[0].y - tuple[1].y}px`;
            }
            measure.textContent = line.style.height;
            // positionLineMeasure(line);
        }

    }

    function clickWrapper(e) {
        if (e.target.tagName === 'IMG') {
            if (allow_line_creation) {
                let line = document.createElement('div');
                let measure = document.createElement('span');

                includeVertex(e);
                if (vertex_tuple.length === 1) {
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
        measure.setAttribute('vertical', e.clientY < image_wrapper.clientHeight / 2 - window.scrollY);
        measure.setAttribute('horizontal', e.clientX < image_wrapper.clientWidth / 2 - window.scrollX);
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

    M.subscribe('set-line', clickWrapper);
    M.subscribe('preview-line', previewLine);
    M.subscribe('prepare-move-line', prepareMoveLine);
    M.subscribe('move-line', moveLine);

    // toggleLinesCreator();
    window.addEventListener('scroll', saveScrollPosition);
    image_wrapper.addEventListener('click', M.publish('set-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('preview-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('move-line').topic);
    image_wrapper.addEventListener('mousedown', M.publish('prepare-move-line').topic);
    image_wrapper.addEventListener('mouseup', () => mouse_pressed = false);
})();