const path = require("path");

const checkPayload = (req, res, next) => {
    if (!req?.files?.file) {
        return res.status(400).json({
            status: "error",
            message: "no file selected",
        });
    }

    const fileExt = path.parse(req.files.file.name).ext;
    if (![".pdf"].includes(fileExt)) {
        return res.status(400).json({
            status: "error",
            message: "unvalid file type. only pdf files are allowed",
        });
    }
    next();
};

module.exports = checkPayload;
