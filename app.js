const express = require("express");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const app = express();
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");

require("dotenv").config({ path: ".env" });

const checkPayload = require("./middleware/checkPayload");

app.use(cors());
app.use(express.json());
app.use(fileUpload({ createParentPath: false }));

const saveFile = (file) => {
    return new Promise((resolve, reject) => {
        const filename = path
            .parse(file.name)
            .name.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "")
            .replace(/ /g, "");
        const extention = path.parse(file.name).ext;
        file.mv(`${__dirname}/files/${filename}${extention}`, (err) => {
            if (err) reject(err);
            else resolve(filename);
        });
    });
};

const convertPDFToWord = (filename) => {
    return new Promise((resolve, reject) => {
        exec(
            `pdf2docx convert files/${filename}.pdf files/${filename}.docx`,
            (error, stdout, stderr) => {
                console.log("entered");
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }
                const output = `${__dirname}/files/${filename}.docx`;
                if (stderr) {
                    if (stderr.includes("Creating pages")) resolve(output);
                    else reject(stderr);
                    return;
                }
                resolve(output);
            }
        );
    });
};

const convertPDFToPPT = (filename) => {
    return new Promise((resolve, reject) => {
        exec(
            `pdf2pptx files/${filename}.pdf --output files/${filename}.pptx`,
            (error, stdout, stderr) => {
                console.log("entered");
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }
                const output = `${__dirname}/files/${filename}.pptx`;
                if (stderr) {
                    resolve(output);
                    return;
                }
                resolve(output);
            }
        );
    });
};

app.post("/convertToWord", checkPayload, async (req, res) => {
    try {
        const pdfFile = req.files.file;
        const filename = await saveFile(pdfFile);
        const docxFilePath = await convertPDFToWord(filename);
        console.log(docxFilePath);
        // res.json({ status: "success", message: "file converted" });
        res.download(docxFilePath, (err) => {
            if (err) {
                console.log(err);
            }
            fs.unlinkSync(docxFilePath);
            fs.unlinkSync(`${__dirname}/files/${filename}.pdf`);
        });
    } catch (err) {
        res.json({
            status: "error",
            message: "internal server error",
            error: err,
        });
    }
});
app.post("/convertToPpt", checkPayload, async (req, res) => {
    try {
        const pdfFile = req.files.file;
        const filename = await saveFile(pdfFile);
        const docxFilePath = await convertPDFToPPT(filename);
        console.log(docxFilePath);
        // res.json({ status: "success", message: "file converted" });
        res.download(docxFilePath, (err) => {
            if (err) {
                console.log(err);
            }
            fs.unlinkSync(docxFilePath);
            fs.unlinkSync(`${__dirname}/files/${filename}.pdf`);
        });
    } catch (err) {
        res.json({
            status: "error",
            message: "internal server error",
            error: err,
        });
    }
});

const port = process.env.PORT || 7002;
app.listen(port, () => console.log(`Server started on port ${port}`));
