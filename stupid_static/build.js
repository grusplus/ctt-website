/**
 * Object.prototype.forEach() polyfill
 * https://gomakethings.com/looping-through-objects-with-es6/
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!Object.prototype.forEachhh) {
    Object.defineProperty(Object.prototype, 'forEachhh', {
        value: function (callback, thisArg) {
            if (this == null) {
                throw new TypeError('Not an object');
            }
            // thisArg = thisArg;
            for (var key in this) {
                if (this.hasOwnProperty(key)) {
                    callback.call(thisArg, this[key], key, this);
                }
            }
        },
        writable: false,
        configurable: false
    });
}

const fs = require('fs');
const Mustache = require('mustache');

const SRC_FOLDER = "web_src/";
const BUILD_FOLDER = "web_build/";

const PARTIALS_FOLDER = SRC_FOLDER + "partials/";
const PAGES_FOLDER = SRC_FOLDER + "pages/";

const structure = JSON.parse(fs.readFileSync('stupid_static/structure.json', 'utf8'));

const prePartials = ['header.html'];
const postPartials = ['footer.html'];

doBuild = () => {
    // deleteFolder(BUILD_FOLDER);

    processStructureLevel(structure, BUILD_FOLDER);
};

processStructureLevel = (substructure, parentFolder, filePrefix = "") => {
    if(!fs.existsSync(parentFolder)){
        fs.mkdirSync(parentFolder);
    }
    substructure.forEachhh((fileMetaOrFolderStructure, fileOrFolderName) => {
        let isFile = fileOrFolderName.indexOf(".html") > -1;
        if(isFile){
            fileMetaOrFolderStructure['key'] = filePrefix + fileOrFolderName.replace(".html", "");
            fileMetaOrFolderStructure['theme'] = fileMetaOrFolderStructure.hasOwnProperty('theme') ? fileMetaOrFolderStructure['theme'] : "default";
            let html = "";
            html += getPartialHtml(prePartials, fileMetaOrFolderStructure);
            html += getPageHtml(filePrefix + fileOrFolderName, fileMetaOrFolderStructure);
            html += getPartialHtml(postPartials, fileMetaOrFolderStructure);

            fs.writeFileSync(parentFolder + "/" + fileOrFolderName, html, 'utf-8');
        }else{
            processStructureLevel(fileMetaOrFolderStructure, parentFolder + "/" + fileOrFolderName, fileOrFolderName + "-");
        }
    });
};

getPartialHtml = (arrayOfPartialNames, pageData) => {
    let html = "";
    arrayOfPartialNames.forEachhh((partialName, index) => {
        let template = fs.readFileSync(PARTIALS_FOLDER + partialName, 'utf8');
        html += Mustache.render(template, pageData);
    });
    return html;
};

getPageHtml = (pageName, pageData) => {
    let html = "";
    let template = fs.readFileSync(PAGES_FOLDER + pageName, 'utf8');
    html += Mustache.render(template, pageData);

    return html;
};

doBuild();