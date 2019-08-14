(function () {
  const link = document.createElement('a');
  const download = document.getElementById('download');
  const image_input = document.getElementById('image-input');
  const image_wrapper = document.getElementById('image-wrapper');
  const screen_shot_hide = [...document.querySelectorAll('[screenShotHide]')];
  const images = [];
  let name;

  function uploadImage(e) {
    const input = e.target;
    [...input.files].forEach(file => {
      let reader = new FileReader();
      name = file.name;
      reader.readAsDataURL(file);
      reader.addEventListener('load', M.publish('prepare-capture').topic);
    });
  }

  function rePositionLines(img) {
    const height = img.height;
    console.log(height);
    const lines = [...image_wrapper.getElementsByClassName('line')];
    lines.forEach(line => 
      line.style.top = `${px(line.style.top) + height}px`
    );
  }

  function readerLoaded(e) {
    const img = document.createElement('img');
    const imgSegment = document.createElement('div');
    img.src = e.target.result;
    imgSegment.className = 'imgSegment';
    imgSegment.appendChild(img);
    image_wrapper.insertBefore(imgSegment, image_wrapper.childNodes[0]);
    img.addEventListener('load', e => {
      imgSegment.style.setProperty('--width', `${img.width}px`);
      imgSegment.style.setProperty('--height', `${img.height}px`);
      images.push(link.href);
      rePositionLines(img);
      localStorage.setItem('files', JSON.stringify(images));
    });
  }

  // function renderFromStorage() {
  //   const localImages = JSON.parse(localStorage.getItem('files'));
  //   localImages.forEach(img => readerLoaded({target: {result: img}}));
  // }

  function removeHide() {
    screen_shot_hide.forEach(elem => elem.classList.remove('hide'));
  }

  function capture() {
    screen_shot_hide.forEach(elem => elem.classList.add('hide'));
    html2canvas(image_wrapper, {
      onrendered(canvas) {
        canvas.toBlob(image => { // to blob method needed if the image gets too big
          image = URL.createObjectURL(image);
          link.href = image;
          link.download = `red-hand-${name}`;
          link.click();
          removeHide();
          restoreScroll();
        });
      }
    });
  }

  function activateKeyCommands() { // ---------------------- not using it
    if (!window.areKeyCommandsActivated) { // not native, just made it up
      window.addEventListener('keydown', deliverKeyCall);
      window.areKeyCommandsActivated = true;
    }
  }

  function deliverKeyCall(e) {
    switch (e.which) {
      case 81: // q and Q
        M.publish('create-line').topic(e);
        break;
    }
  }

  function restoreScroll() {
    const ls = localStorage;
    window.scrollTo(ls.getItem('scrollX'), ls.getItem('scrollY'));
  }

  // if(localStorage.getItem('files')) {
  //   renderFromStorage();
  //   removeHide();
  // }

  M.subscribe('prepare-capture', readerLoaded);
  M.subscribe('prepare-capture', removeHide);
  // M.subscribe('prepare-capture', activateKeyCommands);

  image_input.addEventListener('input', uploadImage);
  download.addEventListener('click', e => {
    e.preventDefault();
    capture();
  });
})();