const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');
const form = document.querySelector('#img-form');

function loadImage(e) {
  const file = e.target.files[0];

  if (!isFileImage(file)) {
    alertError('Please select an image file');
    return;
  }

  const image = new Image()
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
    alertSucces('Image loaded');
  }

  form.style.display = 'block';
  filename.innerHTML = file.name;
  outputPath.innerHTML = path.join(homedir.get(), "imageResizer");
}

function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file['type'])
}

function sendImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    alertError('Please select an image file');
    return;
  }

  const height = heightInput.value
  const width = widthInput.value
  const imgPath = img.files[0].path

  if (height == "" || width == "") {
    alertError('Please select a height and width');
    return;
  }
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  })
}
ipcRenderer.on('image:on', () => {
  alertSucces('Image resized')
})


function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "red",
      color: "white",
      textAlign: "center"
    }
  })
}

function alertSucces(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: "green",
      color: "white",
      textAlign: "center"
    }
  })
}



img.addEventListener('change', loadImage);
form.addEventListener("submit", sendImage)
