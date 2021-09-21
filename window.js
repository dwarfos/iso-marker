const {
    ipcRenderer
} = require("electron");

// onIsoFileSelectorChange will be triggered when user selects ISO.
const onIsoFileSelectorChange = () => {
    // get selected file path.
    const path = document.querySelector("#iso-file-selector").files[0].path;

    if (path != undefined) {
        console.log(path);
        document.querySelector("#account-current").innerHTML = "Loading...";
        document.querySelector("#iso-file-selector").disabled = true;
        document.querySelector("#set-account").disabled = true;
        document.querySelector("#selected-file-path").innerHTML = path;
        document.querySelector("#account-offset").innerHTML = "";

        // send selected file path to background process. After this event we are
        // expecting that backend will file `event:file-account-found`.
        ipcRenderer.send("event:form-iso-selected", path);
    }
};

// onSetAccountClick will be triggered when user clicks "Set Account" button.
const onSetAccountClick = () => {
    // get new account from input
    let newAccount = document.querySelector("#account-field").value;

    // set wanted account name to background process. After this event we are
    // expecting that backend will file `event:file-account-set`.
    ipcRenderer.send("event:form-set-account", newAccount);
};

// onFileAccountFound will be triggered when background process opens file.
// here background will send us information about offset and current account.
const onFileAccountFound = (e, data) => {
    document.querySelector("#account-current").innerHTML = data;
    document.querySelector("#iso-file-selector").disabled = false;
    document.querySelector("#set-account").disabled = false;

    // set 100% progress because sometimes it will be 99% etc.
    document.querySelector("#progress-bar").style.width = "100%";
};

const onFileOffsetFound = (e, data) => {
    document.querySelector("#account-offset").innerHTML = data;
};

const fileProgressBar = (e, data) => {
    document.querySelector("#progress-bar").style.width = data + "%";
};

// onFileAccountSet will be triggered when backend process setted required
// account. When this process is done. Here background will send us offset and
// current account
const reloadFile = (e, data) => {
    onIsoFileSelectorChange();
};

// set triggers on inputs
document.querySelector("#iso-file-selector").addEventListener("change",
    onIsoFileSelectorChange);
document.querySelector("#set-account").addEventListener("click",
    onSetAccountClick);

// 'event:file-account-found' will be called from background process when
// iso file is opened and account with offset is found.
ipcRenderer.on("event:file-account-found", onFileAccountFound);
ipcRenderer.on("event:file-offset-found", onFileOffsetFound);
ipcRenderer.on("event:file-progress-bar", fileProgressBar);

// 'event:file-account-set' will be called from background process when
// iso file was modified with asked account.
ipcRenderer.on("event:file-account-set", reloadFile);

ipcRenderer.on("event:file-account-not-found", () => {
    document.querySelector("#account-current").innerHTML = "Not Found!";
    document.querySelector("#iso-file-selector").disabled = false;
    document.querySelector("#set-account").disabled = true;
    
    document.querySelector("#progress-bar").style.width = 0;
});