import fs from 'fs'

const deleteLocalFiles = (files) => {
    files.forEach((filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    })
}

export {deleteLocalFiles}