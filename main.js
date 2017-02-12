const electron = require('electron')
const {globalShortcut} = require('electron')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const ipc = require('electron').ipcMain
const dialog = electron.dialog;
const fs = require('fs'); 

var globalFilePath
var testing = "wtf"

ipc.on('asynchronous_load_scratch', function (event, arg) {
  load_scratch()
})

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/app/index.html`)

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', () => {
  // Register a 'CommandOrControl+Y' shortcut listener.
  //globalShortcut.register('CommandOrControl+R', () => {
    //put code to run code here
    //load_scratch()
  //})
})

const Menu = electron.Menu
const name = electron.app.getName();
let template = [{
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      label: 'Settings',
      accelerator: 'Command+,',
      click: function() {
        showSettingsWindow();
      }
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: function() {
        app.quit()
      }
    }]
}, {
  label: 'File',
  submenu: [{
    label: 'Run',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, focusedWindow) {
      load_scratch()
    }
  }, {
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click: function() {
      // Open a new file and either put it in the same window
      // or put it in a new window
      selectFileDialog((files) => {
        if (files != undefined) {
          globalFilePath = files;
          // Set the title of the window to the global filename
          mainWindow.setTitle("p6js - " +globalFilePath );
          // extract the filename
          var array = globalFilePath.split("/");
          filename = array[array.length - 1];
          readFile(files, (content) => {
            // Send to page
            mainWindow.webContents.send('file-contents', content);
          });
        }
      });
    }
  
  }, {
    label: 'Save',
    accelerator: 'CmdOrCtrl+S',
    click: function(item,focusedWindow){
      if (globalFilePath == undefined) {
      //  saveFileDialog()
      } else {
       // mainWindow.webContents.send('getSave');
      }
    }
  }, {
    label: 'Save As',
    accelerator: 'CmdOrCtrl+Shift+S',
    click: function(item,focusedWindow){
      saveFileDialog()
    }
  }]
}, {
  label: 'Edit',
  submenu: [{
    label: 'Undo',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: 'Redo',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: 'Cut',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: 'Copy',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: 'Paste',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: 'Select All',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: 'Window',
  role: 'window',
  submenu: [{
    label: 'Minimize',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: 'Close',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }, {
    type: 'separator'
  }, {
    label: 'Reopen Window',
    accelerator: 'CmdOrCtrl+Shift+T',
    enabled: false,
    key: 'reopenMenuItem',
    click: function () {
      app.emit('activate')
    }
  }]
}, {
  label: 'Help',
  role: 'help',
  submenu: [{
    label: 'Learn More',
    click: function () {
      electron.shell.openExternal('https://github.com/jtoy/p6js')
    }
  }]
}]
app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

function load_scratch(){
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  newWindow = new BrowserWindow({width: width, height: height})
  if(globalFilePath){
    fs.createReadStream(globalFilePath).pipe(fs.createWriteStream(`${__dirname}/app/template/sketch.js`));
  }
  var path = `file://${__dirname}/app/template/index.html`
  console.log(path)
  newWindow.loadURL(path)
}


function saveFileDialog(callback) {
  dialog.showSaveDialog({
  }, function(filePath) {
    // Get the content from the renderer
    mainWindow.webContents.send('getSaveAs');
    console.log("SADSDSDDSD")
    ipc.on('fileSaveAs', function(event, data) {
    console.log("IIIISADSDSDDSD")
      writeFile(filePath, data) 
      //writeFile(filePath, data, function(callback) {
        //BECUASE THIS DOESNT TAKE MUTIPLE FUNCTIONS?
        console.log("HERER")
        error('success', "<strong>Success!</strong> File Saved");
        globalFilePath = filePath;
        console.log("SDASDSDSDS")
        var array = globalFilePath.split("/");
        filename = array[array.length - 1];
        //callback();
      });
    //}
    //);
  });
}

ipc.on('fileSave', function(event, data) {
  writeFile(globalFilePath, data);
});

function error(type, message) {
  var data = {
    type: type,
    message: message
  };
  mainWindow.webContents.send('error', data);
}

function writeFile(filePath, contents) {
  if (filePath != undefined) {
    fs.writeFile(filePath, contents, (err) => {
      if (err) {
        error('danger', "<strong>Uh-Oh!</strong> There was an error saving the file.");
      } else {
        error("success", "<strong>Success!</strong> The file has been saved.");
        mainWindow.setTitle("p6js - " + filePath);
      }
    });
  }
}

function save_scratch_or_global_file(content){
  if(globalFilePath){
    var filepath = globalFilePath
  }else{
    var filepath = `${__dirname}/app/template/sketch.js`
  }
  console.log("wtf: "+filepath)


  fs.writeFile(filepath, content, function (err) {
    if(err){
      console.log(err);
      return;
    }
  });

}
ipc.on('async_save_scratch_or_global_file', function(event, data) {
  save_scratch_or_global_file(data);
});

function selectFileDialog(callback) {
  dialog.showOpenDialog({
    properties: ['openFile'],
  }, function(file) {
    if (file != undefined) {
      callback(file[0]);
    } else {
      callback(undefined);
    }
  });
}

function readFile(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      error('danger', '<strong>Uh-Oh!</strong> There was an error reading the file. Error: ' + err);
      callback();
    } else {
      callback(data);
    }
  });
}


