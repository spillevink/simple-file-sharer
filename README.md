Simple File Uploader/Downloader
===

Simple File Uploader/Downloader is a file uploader written using HTML5 and Node.js.

Clearly, it is not a revolutionary file uploader that will change the way mankind upload their files. Seeing that many people are actually interested in both HTML5 File API and Node.js, this is just a modified version of mertys "Simple File Uploader" (https://github.com/merty/simple-file-uploader). Hope it's usefull for someone else than me.

Usage
---

1. Clone the repository or download and extract the files.
2. Install Node.js if you haven't already.
3. Go to the directory where index.js etc. are.
4. Edit config.js if you wish to change the upload directory or the port number.
5. Run the application using `node index.js`
6. Go to `http://<IP_ADDRESS>:<PORT>` where `<IP_ADDRESS>` is the IP address of the machine where the application is running and the `<PORT>` is the port number defined in `config.js` which is `8000` by default.
7. Drag and drop files to the marked area to upload the files to the `upload_dir` defined in `config.js`.
8. Copy the url from the dialog and send it to friends and enemies.

License
---

This application is released under the MIT License. See the `LICENSE` file for details.