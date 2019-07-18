(function () {
    const imagesController = document.getElementById('images-controller');
    const imageWrapper = document.getElementById('image-wrapper');

    function renderSideBar() {
        const images = [...imageWrapper.querySelectorAll('img')];
        imagesController.innerHTML = '';
        images.forEach((image, i) => {
            const li = document.createElement('li');
            const img = document.createElement('img');
            const button = document.createElement('button');
            const svg = document.createElement('img');

            img.src = image.src;
            img.alt = `image in ${i + 1}° place`;

            svg.src = './img/delete.svg';
            svg.alt = `delete image in ${i + 1}° place`;
            svg.className = 'delete';

            button.appendChild(svg);
            li.appendChild(img);
            li.appendChild(button);
            imagesController.appendChild(li);
        });
    }
    M.subscribe('prepare-capture', renderSideBar);
    imagesController.addEventListener('click', e => {
        let li;
        if(e.target.tagName === 'BUTTON') {
            li = e.target.parentElement;
        } else if(e.target.className === 'delete') {
            li = e.target.parentElement.parentElement;
        }
        if(li) {
            const i = +[...imagesController.children].indexOf(li);
            imageWrapper.children[i].remove();
            li.remove();
        }
    });
})();