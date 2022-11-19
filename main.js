const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require("resize-img")

const isMac = process.platform === 'darwin'
const isDev = process.env.NODE_ENV !== 'production'
const WIDTH = 500, HEIGHT = 600;

let mainWindow = null
function createMainWindow() {
   mainWindow = new BrowserWindow({
      title: 'Image Resizer',
      width: !isDev ? WIDTH : WIDTH + 500,
      height: HEIGHT,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: true,
         preload: path.join(__dirname, 'preload.js'),
      }
   })
   if (isDev) {
      // mainWindow.webContents.openDevTools()
   }


   mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}

function createAboutWindow() {
   const win = new BrowserWindow({
      title: 'Image Resizer',
      width: WIDTH,
      height: HEIGHT,
      icon: `${__dirname}/assets/icons/Icon_256x256.png`,
   })
   win.loadFile(path.join(__dirname, './renderer/about.html'))
}
app.on('ready', () => {
   createMainWindow()

   const mainMenu = Menu.buildFromTemplate(menu)
   Menu.setApplicationMenu(mainMenu)

   mainWindow.on('closed', () => mainWindow = null)

   app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
         createMainWindow()
      }
   })
})


app.on("window-all-closed", () => {
   if (!isMac)
      app.quit()
})


const menu = [
   ...(isMac
      ? [
         {
            label: app.name,
            submenu: [
               {
                  label: 'About',
                  click: createAboutWindow,
               },
            ],
         },
      ]
      : []),

   ...(!isMac
      ? [
         {
            label: 'Help',
            submenu: [
               {
                  label: 'About',
                  click: createAboutWindow,
               },
            ],
         },
      ]
      : []),
   {
      label: 'File',
      submenu: [
         {
            label: 'Quit',
            click: () => app.quit(),
            accelerator: 'CmdOrCtrl+W',
         },
      ],
   },
   ...(isDev
      ? [
         {
            label: 'Developer',
            submenu: [
               { role: 'reload' },
               { role: 'forcereload' },
               { type: 'separator' },
               { role: 'toggledevtools' },
            ],
         },
      ]
      : []),
];

async function resizeImage({ imgPath, dest, width, height }) {
   try {
      const newPath = await resizeImg(fs.readFileSync(imgPath), {
         width: +width,
         height: +height,
      })
      const filename = path.basename(imgPath)

      if (!fs.existsSync(dest)) {
         fs.mkdirSync(dest)
      }

      fs.writeFileSync(path.join(dest, filename), newPath)

      mainWindow.webContents.send("image:done")

      shell.openPath(dest)

   } catch (error) {
      console.log(error)
   }
}

ipcMain.on("image:resize", (e, options) => {
   options.dest = path.join(os.homedir(), 'imageResizer')
   resizeImage(options)
})