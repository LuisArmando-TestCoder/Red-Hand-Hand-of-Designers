(function () {
  const link = document.createElement('a');
  const download = document.getElementById('download');
  const image_input = document.getElementById('image-input');
  const image_wrapper = document.getElementById('image-wrapper');
  const screen_shot_hide = [...document.querySelectorAll('[screenShotHide]')];
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

  function readerLoaded(e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    image_wrapper.appendChild(img);
  }

  function removeHide() {
    screen_shot_hide.forEach(elem => elem.classList.remove('hide'));
  }

  function capture() {
    screen_shot_hide.forEach(elem => elem.classList.add('hide'));
    html2canvas(image_wrapper, {
      onrendered(canvas) {
        const image = canvas.toDataURL();
        link.href = image;
        link.download = `red-hand-${name}`;
        link.click();
        removeHide();
        restoreScroll();
      }
    });
  }

  function activateKeyCommands() { // ---------------------- not using it
    if (!window.areKeyCommandsActivated) { // not native, just made it up
      window.addEventListener('keydown', deliverKeyCall);
      window.areKeyCommandsActivated = true;
    }
  }

  function restoreScroll() {
    const ls = localStorage;
    window.scrollTo(ls.getItem('scrollX'), ls.getItem('scrollY'));
  }

  function deliverKeyCall(e) {
    switch (e.which) {
      case 81: // q and Q
        M.publish('create-line').topic(e);
        break;
    }
  }

  M.subscribe('prepare-capture', readerLoaded);
  M.subscribe('prepare-capture', removeHide);
  // M.subscribe('prepare-capture', activateKeyCommands);

  image_input.addEventListener('input', uploadImage);
  download.addEventListener('click', e => {
    e.preventDefault();
    capture();
  });
})();