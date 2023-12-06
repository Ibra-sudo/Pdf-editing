const Title = document.querySelector(".title");
const Tools = document.querySelector(".tools");
const dragArea = document.querySelector(".drag-area");
const imageArea = document.querySelector(".image-area");
const dragText = document.querySelector(".header");
const btnLeft = document.querySelector("#btnLeft");
const btnRight = document.querySelector("#btnRight");
const btnMinus = document.querySelector("#btnMinus");
const zoomDisplay = document.querySelector("#zoomDisplay");
const heightDisplay = document.querySelector("#heightDisplay");
const widthDisplay = document.querySelector("#widthDisplay");
const btnPlus = document.querySelector("#btnPlus");
const btnCrop = document.querySelector("#btnCrop");
const btnDownload = document.querySelector("#btnDownload");

let button = document.querySelector(".button");
let input = document.querySelector("input");

let rotation = 0;
let scale = 1;
const originalWidth = 200;
const originalHeight = 100;

const cmPerPixel = 0.1;
let startX, startY, startTranslateX, startTranslateY;
let isDragging = false;

btnLeft.addEventListener("click", () => {
  rotation -= 90;
  applyTransform();
});
btnRight.addEventListener("click", () => {
  rotation += 90;
  applyTransform();
});

btnMinus.addEventListener("click", () => {
  scale = Math.max(0.2, scale - 0.1);
  applyTransform();
  displayZoomInfo();
});
btnPlus.addEventListener("click", () => {
  scale = Math.min(2.5, scale + 0.1);
  applyTransform();
  displayZoomInfo();
});

imageArea.addEventListener("mousedown", startDrag);
imageArea.addEventListener("mousemove", dragImage);
imageArea.addEventListener("mouseup", endDrag);
imageArea.addEventListener("mouseleave", endDrag);

btnDownload.addEventListener("click", downloadImage);

let file;

button.onclick = () => {
  input.click();
};

input.addEventListener("change", function () {
  Title.textContent = "Edit";
  file = this.files[0];
  dragArea.classList.add("active");
  imageArea.classList.add("active");
  Title.classList.add("active");
  Tools.classList.add("active");
  displayFile();
});

dragArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragText.textContent = "Release to Upload";
  Title.textContent = "Edit";
  dragArea.classList.add("active");
  imageArea.classList.add("active");
  Title.classList.add("active");
  Tools.classList.add("active");
});

dragArea.addEventListener("dragleave", (e) => {
  dragText.textContent = "Drag & Drop";
  Title.textContent = "Upload your File";
  dragArea.classList.remove("active");
  imageArea.classList.remove("active");
  Title.classList.remove("active");
  Tools.classList.remove("active");
});

dragArea.addEventListener("drop", (e) => {
  e.preventDefault();
  file = e.dataTransfer.files[0];
  // console.log(file);
  displayFile();
});

function displayFile() {
  let fileType = file.type;
  // console.log(fileType);
  let validImageExtensions = ["image/jpeg", "image/jpg"];
  let validPdfExtension = ["application/pdf"];
  if (validImageExtensions.includes(fileType)) {
    displayImage();
  } else if (validPdfExtension.includes(fileType)) {
    displayPdf();
  } else {
    alert("Unsupported file type. Please upload a valid image or PDF file.");
    imageArea.innerHTML = ""; // Clear the image area
    imageArea.classList.remove("active");
  }
}
let cropper;

function displayImage() {
  let fileReader = new FileReader();
  // console.log(fileReader);
  fileReader.onload = () => {
    let fileURL = fileReader.result;
    // console.log(fileURL);
    let imgTag = `<img id="imageToCrop" src="${fileURL}" alt="" style="width: 100%; height: 100%; max-width: 1920px; max-height: 1200px;" >`;
    imageArea.innerHTML = imgTag;
    btnCrop.addEventListener("click", function () {
      cropper = new Cropper(document.getElementById("imageToCrop"), {
        aspectRatio: 16 / 24, // You can adjust the aspect ratio as needed
        autoCrop: false,
      });
    });
  };
  fileReader.readAsDataURL(file);
}

function displayPdf() {
  let fileReader = new FileReader();
  fileReader.onload = () => {
    let fileURL = fileReader.result;
    let pdfTag = `<embed id="pdfToCrop" src="${fileURL}#toolbar=0" type="application/pdf" style="width: 500px; height: 600px;" />`;
    // let pdfTag = `<object data="${fileURL}" type="application/pdf" width="100%" height="100%">
    //               <p>Your browser does not support viewing PDFs.
    //               <a href="${fileURL}">Click here to download the PDF</a>.</p>
    //             </object>`;
    // let fileUint8Array = new Uint8Array(fileReader.result);
    // // Load PDF using PDF.js
    // pdfjsLib.getDocument({ data: fileUint8Array }).promise.then((pdfDoc) => {
    //   // Assuming a single page PDF for simplicity
    //   pdfDoc.getPage(1).then((page) => {
    //     let canvas = document.createElement("canvas");
    //     let context = canvas.getContext("2d");
    //     let viewport = page.getViewport({ scale: 1 });

    //     // Set canvas size
    //     canvas.width = viewport.width;
    //     canvas.height = viewport.height;

    //     // Render PDF page on canvas
    //     page.render({ canvasContext: context, viewport: viewport });

    //     // Append canvas to the imageArea
    //     imageArea.innerHTML = "";
    //     imageArea.appendChild(canvas);
    //   });
    // });
    imageArea.innerHTML = pdfTag;
    btnCrop.addEventListener("click", function () {
      cropper = new Cropper(document.getElementById("pdfToCrop"), {
        aspectRatio: 16 / 24, // You can adjust the aspect ratio as needed
        autoCrop: false,
      });
    });
  };
  fileReader.readAsDataURL(file);
  // fileReader.readAsArrayBuffer(file);
}

function cropImage() {
  // Get the cropped data
  const croppedData = cropper.getCroppedCanvas().toDataURL("image/png");
  // Create a link element and trigger the download
  const link = document.createElement("a");
  link.href = croppedData;
  link.download = "cropped_image.png";
  link.click();
}

function startDrag(e) {
  if (e.button !== 0) return; // Only respond to left mouse button
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startTranslateX = getTranslateX();
  startTranslateY = getTranslateY();
  imageArea.style.cursor = "grabbing";
}

function dragImage(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  const translateX = startTranslateX + deltaX / scale;
  const translateY = startTranslateY + deltaY / scale;
  setTranslate(translateX, translateY);
}

function endDrag() {
  isDragging = false;
  imageArea.style.cursor = "grab";
}

function displayZoomInfo() {
  const zoomPercent = Math.round(scale * 100);
  const heightCm = Math.round(originalHeight * scale * cmPerPixel);
  const widthCm = Math.round(originalWidth * scale * cmPerPixel);

  // Display the zoom level, height, and width
  zoomDisplay.textContent = `S: ${zoomPercent} %`;
  heightDisplay.textContent = `H: ${heightCm} cm`;
  widthDisplay.textContent = `W: ${widthCm} cm`;
}

function applyTransform() {
  const translateX = getTranslateX();
  const translateY = getTranslateY();
  imageArea.style.transform = `scale(${scale}) rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`;
}

function getTranslateX() {
  const transform = window
    .getComputedStyle(imageArea)
    .getPropertyValue("transform");
  const matrix = new DOMMatrix(transform);
  return matrix.m41;
}

function getTranslateY() {
  const transform = window
    .getComputedStyle(imageArea)
    .getPropertyValue("transform");
  const matrix = new DOMMatrix(transform);
  return matrix.m42;
}

function setTranslate(translateX, translateY) {
  imageArea.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

function downloadImage() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // const image = document.getElementById('image');

  // Set canvas dimensions to match the image
  canvas.width = Image.width;
  canvas.height = Image.height;

  // Draw the image onto the canvas
  ctx.drawImage(Image, 0, 0);

  // Convert the canvas content to a data URL (PNG format)
  const dataUrl = canvas.toDataURL("image/png");

  // Create a link element and trigger the download
  const downloadLink = document.createElement("a");
  downloadLink.href = dataUrl;
  downloadLink.download = "edited_image.png";
  downloadLink.click();
}
