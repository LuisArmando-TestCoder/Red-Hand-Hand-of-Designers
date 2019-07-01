(function () {
    const image_wrapper = document.getElementById('image-wrapper');
    const vertex = {
        x: null,
        y: null
    };
    let vertex_tuple = [];
    let allow_line_creation = true;
    let allow_line_move = false;
    let line_weight = 2;
    let target_line;
    let target_measure;

    function toggleLinesCreator() {
        allow_line_creation = !allow_line_creation;
    }

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

    function toggleMoveLine(e) {
        if (e.target.classList.contains('line') && vertex_tuple.length === 0) {
            allow_line_move = !allow_line_move;
            target_line = e.target;
        }
    }

    function moveLine(e) {
        if (allow_line_move) {
            target_line.style.left = `${e.clientX - target_line.style.width.split('px')[0] / 2}px`;
            target_line.style.top = `${e.clientY - target_line.style.height.split('px')[0] / 2}px`;
            positionLineMeasure(e);
        }
    }

    function positionLineMeasure(e) {
        const measure = target_line.querySelector('span');
        measure.setAttribute('vertical', e.clientY < image_wrapper.clientWidth / 2);
        measure.setAttribute('horizontal', e.clientX < image_wrapper.clientHeight / 2);
    }

    M.subscribe('set-line', clickWrapper);
    M.subscribe('preview-line', previewLine);
    M.subscribe('prepare-move-line', toggleMoveLine);
    M.subscribe('move-line', moveLine);

    // toggleLinesCreator();
    window.addEventListener('scroll', saveScrollPosition);
    image_wrapper.addEventListener('click', M.publish('set-line').topic);
    image_wrapper.addEventListener('click', M.publish('prepare-move-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('preview-line').topic);
    image_wrapper.addEventListener('mousemove', M.publish('move-line').topic);
    // image_wrapper.addEventListener('mousemove', M.publish('preview-line').topic); // when stretching line
})();