(function () {
    const imagesController = document.getElementById('images-controller');
    const imageWrapper = document.getElementById('image-wrapper');

    function renderSideBar() {
        const images = [...imageWrapper.querySelectorAll('img')];
        imagesController.innerHTML = '';
        images.forEach(image => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            const img = document.createElement('img');
            const button = document.createElement('button');
            const svg = document.createElement('img');

            img.src = image.src;
            img.className = 'previews';

            svg.src = './img/delete.svg';
            svg.className = 'delete';

            button.appendChild(svg);
            a.appendChild(img);
            li.appendChild(button);
            li.appendChild(a);
            imagesController.appendChild(li);
        });
        setAnchorsIds();
    }

    function deleteImage(e) {
        let li;
        if (e.target.tagName === 'BUTTON') {
            li = e.target.parentElement;
        } else if (e.target.className === 'delete') {
            li = e.target.parentElement.parentElement;
        }
        if (li) {
            const i = getChildIndex(li);
            imageWrapper.children[i].remove();
            li.remove();
            setAnchorsIds();
        }
    }
    function setAnchorsIds() {
        const images = [...imageWrapper.querySelectorAll('img')];
        const anchors = [...imagesController.querySelectorAll('a')];
        images.forEach((img, i) => {
            img.id = `img${i}`;
            anchors[i].href = `#img${i}`;
        });
    }
    M.subscribe('prepare-capture', renderSideBar);
    imagesController.addEventListener('click', deleteImage);
})();