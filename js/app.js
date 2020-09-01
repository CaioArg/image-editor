(() => {
    const dropZone = document.querySelector(".drop-zone");
    const dropArea = document.querySelector(".drop-zone__area");
    const canvas = document.querySelector(".drop-zone__canvas");
    const dropText = document.querySelector(".drop-zone__text");
    const filterInputs = document.querySelectorAll(".control-zone__filter-input");
    const fileInput = document.querySelector(".drop-zone__input");
    const btnInput = document.querySelector(".drop-zone__button");
    const btnTheme = document.querySelector(".btn--theme");
    const btnReset = document.querySelector(".btn--reset");
    const btnRemove = document.querySelector(".btn--remove");
    const btnDownload = document.querySelector(".btn-download");
    const ctx = canvas.getContext("2d");
    let isTouchDevice = matchMedia("(any-pointer: coarse)").matches;
    let img = document.createElement("img");
    let defaultFilters = {
        blur: 0,
        brightness: 1,
        contrast: 1,
        grayscale: 0,
        invert: 0,
        opacity: 1,
        saturate: 1,
        sepia: 0,
        hue: 0
    };
    let currentFilters = { ...defaultFilters };
    let filterString = "";

    function enableInputs() {
        btnDownload.classList.remove("btn--disabled");
        btnReset.classList.remove("btn--disabled");
        btnRemove.classList.remove("btn--disabled");
        filterInputs.forEach( input => input.disabled = false );
    }

    function disableInputs() {
        btnDownload.classList.add("btn--disabled");
        btnReset.classList.add("btn--disabled");
        btnRemove.classList.add("btn--disabled");
        filterInputs.forEach( input => input.disabled = true );
    }

    function readDroppedFile({dataTransfer: {items: [file]}}) {
        let reader = new FileReader();
        reader.onload = () =>  img.src = reader.result;
        reader.readAsDataURL(file.getAsFile());
        updateDownloadName(file.getAsFile());
    }

    function readInputFile () {
        let reader = new FileReader();
        reader.onload = () =>  {
            img.src = reader.result;
            fileInput.value = "";
        }
        updateDownloadName(fileInput.files[0]);
        reader.readAsDataURL(fileInput.files[0]);
    }

    function chooseFile() {
        fileInput.click();
    }

    function updateCanvas(img, filter="none") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = filter;
        ctx.drawImage(img, 0, 0);
    }

    function resetInputs() {
        filterInputs.forEach((input) => {
            input.value = defaultFilters[input.id]
            currentFilters[input.id] = input.value;
        });
        updateFilterString();
        if(img.src) updateCanvas(img);
    }

    function updateFilterString() {
        filterString = `blur(${currentFilters.blur}px) brightness(${currentFilters.brightness}) contrast(${currentFilters.contrast}) grayscale(${currentFilters.grayscale}) invert(${currentFilters.invert}) opacity(${currentFilters.opacity}) saturate(${currentFilters.saturate}) sepia(${currentFilters.sepia}) hue-rotate(${currentFilters.hue}deg)`;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.width = "0px";
        canvas.style.height = "0px";
        btnDownload.removeAttribute("href");
        img.removeAttribute("src");
        isTouchDevice ? btnInput.style.display = "block" : dropText.style.display = "block";
        resetInputs();
        disableInputs();
    }

    function adjustImageSize() {
        let computedValues = getComputedStyle(dropArea);
        let computedWidth = parseFloat(computedValues.getPropertyValue("width").replace("px", ""));
        let computedHeight = parseFloat(computedValues.getPropertyValue("height").replace("px", ""));
        let scaleValue;
        
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.style.width = `${canvas.width}px`;
        canvas.style.height = `${canvas.height}px`;

        let canvasWidth = parseFloat(canvas.style.width.replace("px", ""));
        let canvasHeight = parseFloat(canvas.style.height.replace("px", ""));

        if(canvasWidth > computedWidth) {
            scaleValue = computedWidth/canvasWidth;
            let newWidth =  canvasWidth * scaleValue;
            let newHeight =  canvasHeight * scaleValue;
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
            canvasWidth = parseFloat(canvas.style.width.replace("px", ""));
            canvasHeight = parseFloat(canvas.style.height.replace("px", ""));
        }

        if(canvasHeight > computedHeight) {
            scaleValue = computedHeight/canvasHeight;
            let newWidth =  canvasWidth * scaleValue;
            let newHeight =  canvasHeight * scaleValue;
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;
        }
    }
    
    function loadImage() {
        isTouchDevice ? btnInput.style.display = "none" : dropText.style.display = "none";
        adjustImageSize();
        resetInputs();
        enableInputs();
        updateCanvas(img);
    }

    function resizeCanvas() {
        if(img.src) {
            adjustImageSize();
            updateCanvas(img, filterString);
        }
    }

    function displayErrorMessage() {
        dropText.textContent = "Invalid File. Please Verify If The File Is An Image";
        if(isTouchDevice) {
            btnInput.style.display = "none";
            dropText.style.display = "block";
        }
        setTimeout(() => {
            if(isTouchDevice) {
                dropText.style.display = "none";
                btnInput.style.display = "block";
            }
            dropText.textContent = "Drop Your Image Here";
        }, 3000);
    }

    function updateDownloadName({name}) {
        let splitedName = name.split(".");
        if(splitedName.length == 1) {
            btnDownload.download = name + "-Edited.png";
        } else {
            let downloadName = (splitedName.slice(0, splitedName.length - 1)).join(".");
            btnDownload.download = downloadName + "-Edited.png";
        }
    }

    function uptadeDownloadData() {
        if(img.src) btnDownload.href = canvas.toDataURL();
    }

    function changeColorTheme() {
        let root = document.querySelector(':root');
        switch (root.dataset.theme) {
            case "light":
                root.dataset.theme = "dark";
                break;
            
            case "dark":
                root.dataset.theme = "light";
                break;
        }
    }

    function addDragoverAnimation() {
        dropText.classList.add("dragover-animation");
    }

    function removeDragoverAnimation() {
        dropText.classList.remove("dragover-animation");
    }

    dropZone.addEventListener("dragover", event => event.preventDefault() );
    dropZone.addEventListener("drop", event => event.preventDefault() );
    dropZone.addEventListener("dragenter", addDragoverAnimation);
    dropZone.addEventListener("dragleave", removeDragoverAnimation);
    dropZone.addEventListener("drop", removeDragoverAnimation);
    dropZone.addEventListener("drop", readDroppedFile);
    btnInput.addEventListener("click", chooseFile);
    fileInput.addEventListener("input", readInputFile);
    img.addEventListener("load", loadImage);
    img.addEventListener("error", displayErrorMessage);
    btnTheme.addEventListener("click", changeColorTheme);
    btnReset.addEventListener("click", resetInputs);
    btnRemove.addEventListener("click", clearCanvas);
    btnDownload.addEventListener("click", uptadeDownloadData);

    filterInputs.forEach( input => {
        input.addEventListener("input", () => {
            currentFilters[input.id] = input.value;
            updateFilterString();
            updateCanvas(img, filterString);
        });
    });

    let canvasResizer = new ResizeObserver(resizeCanvas);
    canvasResizer.observe(dropArea);

}) ();