let actualInput = document.querySelector(".actualInput");
function getInput() {
  actualInput.click();
}
let croppedImageSrc = null;
let originalFileName = null;
let cropper = null;
let userId = null;
function imageToCroppingContainer() {
  document.querySelector(".cropped-container").innerHTML = "";
  let currentImage = document.querySelector("#uncropped-image").files[0];
  originalFileName = currentImage.name;
  if (currentImage) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageElement = document.createElement("img");
      imageElement.setAttribute("src", event.target.result);
      imageElement.setAttribute("id", "image");

      imageElement.style.maxWidth = "100%";
      let imageCroppingContainer = document.querySelector(
        ".image-cropping-container"
      );
      imageCroppingContainer.innerHTML = "";
      imageCroppingContainer.appendChild(imageElement);
      imageCroppingContainer.classList.add("add-border");
      const image = document.getElementById("image");

      cropper = new Cropper(image, { aspectRatio: 0 });
    };
    reader.readAsDataURL(currentImage);
  }
}

const cropperButton = document.getElementById("btn-crop");
cropperButton.onclick = (event) => {
  if (!cropper) {
    return alert("please add an image to crop");
  }
  croppedImageSrc = cropper.getCroppedCanvas().toDataURL("image/png");
  let croppedImageElement = document.createElement("img");
  croppedImageElement.src = croppedImageSrc;
  croppedImageElement.setAttribute("id", "cropped-image");
  croppedImageElement.style.maxWidth = "100%";
  let croppedContainer = document.querySelector(".cropped-container");
  croppedContainer.innerHTML = "";
  croppedContainer.appendChild(croppedImageElement);
  croppedContainer.classList.add("add-border");
};

const uploadButton = document.getElementById("upload-btn");
uploadButton.onclick = async () => {
  if (!croppedImageSrc) {
    return alert("please crop an image ");
  }
  let response = await fetch(croppedImageSrc);
  let blob = await response.blob();

  let formData = new FormData();
  formData.append("image", blob, "cropped" + originalFileName);

  const responseFromBackend = await fetch("http://localhost:4000/uploadImage", {
    method: "POST",
    body: formData,
  });
  const message = await responseFromBackend.json();
  const finalMessage = message.msg;

  document.getElementById("uploaded-message").innerHTML = finalMessage;
  const addNewImage = document.createElement("img");
  addNewImage.src = croppedImageSrc;
  addNewImage.classList.add("grid-image");
  document.querySelector(".my-image-grid").appendChild(addNewImage);
};

async function getUserId() {
  const response = await fetch("http://localhost:4000/getUserId");
  const result = await response.json();
  userId = result.userId;
}

async function fetchImagesAndDisplay() {
  const response = await fetch("http://localhost:4000/myImages/:" + userId);
  const data = await response.json();
  if (!response.ok) {
    document.querySelector();
  }
  data.files.forEach((file) => {
    const gridImage = document.createElement("img");
    gridImage.src = file.data;
    gridImage.alt = file.fileName;
    gridImage.classList.add("grid-image");

    document.querySelector(".my-image-grid").appendChild(gridImage);
  });
}

async function showingImages() {
  await getUserId();

  fetchImagesAndDisplay();
}

showingImages();
