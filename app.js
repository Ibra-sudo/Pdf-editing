const title = document.querySelector(".title");
const tools = document.querySelector(".tools");
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

previewImage = imageArea.querySelector("img");
widthInput = document.querySelector(".width");
heightInput = document.querySelector(".height");

let button = document.querySelector(".button");
let input = document.querySelector(".input");

let rotation = 0;
let scale = 1;

// const cmPerPixel = 0.1;
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

btnCrop.addEventListener("click", cropImage);
btnDownload.addEventListener("click", downloadImage);

let file;

button.onclick = () => {
  input.click();
};

input.addEventListener("change", function () {
  title.textContent = "Edit";
  file = this.files[0];
  dragArea.classList.add("active");
  imageArea.classList.add("active");
  title.classList.add("active");
  tools.classList.add("active");
  displayFile();
});

dragArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dragText.textContent = "Release to Upload";
  title.textContent = "Edit";
  dragArea.classList.add("active");
  imageArea.classList.add("active");
  title.classList.add("active");
  tools.classList.add("active");
});

dragArea.addEventListener("dragleave", (e) => {
  dragText.textContent = "Drag & Drop";
  title.textContent = "Upload your File";
  dragArea.classList.remove("active");
  imageArea.classList.remove("active");
  title.classList.remove("active");
  tools.classList.remove("active");
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
  fileReader.onload = () => {
    let fileURL = fileReader.result;
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
    let pdfTag = `<embed id="pdfToCrop" src="${fileURL}" type="application/pdf" style="width: 300%; height: 700px;" />`;
    imageArea.innerHTML = pdfTag;
    // btnCrop.addEventListener("click", function () {
    //   cropper = new Cropper(document.getElementById("pdfToCrop"), {
    //     aspectRatio: 16 / 24, // You can adjust the aspect ratio as needed
    //     autoCrop: false,
    //   });
    // });
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
  if (e.button !== 0) return;
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

function pixelsToCm(pixels, dpi) {
  const cmPerInch = 2.54;
  return pixels / ((dpi * 1) / cmPerInch);
}

function displayZoomInfo() {
  const sizing = imageArea;

  html2canvas(sizing).then((canvas) => {
    const dpi = 72;

    previewImage.src = URL.createObjectURL(file);

    previewImage.addEventListener("load", () => {
      widthInput.value = previewImage.naturalWidth;
      heightInput.value = previewImage.naturalHeight;

      const widthInCm = pixelsToCm(widthInput.value, dpi);
      const heightInCm = pixelsToCm(heightInput.value, dpi);

      const zoomPercent = Math.round(scale * 100);
      const heightCm = Math.round(heightInCm * scale);
      const widthCm = Math.round(widthInCm * scale);

      // console.log("Wcm", widthCm);
      // console.log("Hcm", heightCm);

      // Display the zoom level, height, and width
      zoomDisplay.textContent = `S: ${zoomPercent} %`;
      heightDisplay.textContent = `H: ${heightCm} cm`;
      widthDisplay.textContent = `W: ${widthCm} cm`;
    });
  });
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
  const screenshotTarget = imageArea;

  html2canvas(screenshotTarget).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();

    const rotatedWidth = canvas.height;
    const rotatedHeight = canvas.width;

    pdf.addImage(imgData, "PNG", 70, 70, rotatedWidth / 4, rotatedHeight / 4);

    pdf.save("captured_image.pdf");
    // const link = document.createElement("a");
    // link.href = base64image;
    // link.download = "captured_image.png";
    // link.click();
    // link.remove();
  });
}
